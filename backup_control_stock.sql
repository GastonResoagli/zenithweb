--
-- PostgreSQL database dump
--

\restrict ATgClRmtanUI3oVUXBanCmabDwaVpxteMchm8xtR6sPgepskHMTnlyPzptpC8wX

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: actualizar_entrada(integer, integer, numeric); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.actualizar_entrada(IN p_id_registro integer, IN p_cantidad integer, IN p_precio_compra numeric)
    LANGUAGE plpgsql
    AS $$
  DECLARE
      v_id_producto  INT;
      v_cantidad_ant INT;
      v_tipo         VARCHAR(10);
      v_stock        INT;
  BEGIN
      -- recupera la entrada original y bloquea la fila (evita carreras)
      SELECT id_producto, cantidad, tipo
        INTO v_id_producto, v_cantidad_ant, v_tipo
        FROM registro_inventario
       WHERE id_registro = p_id_registro
       FOR UPDATE;

      IF NOT FOUND THEN
          RAISE EXCEPTION 'Movimiento % no encontrado', p_id_registro;
      END IF;

      -- solo se pueden editar entradas (las salidas vienen de ventas)
      IF v_tipo <> 'entrada' THEN
          RAISE EXCEPTION 'Solo se pueden actualizar movimientos de tipo entrada';
      END IF;

      -- ajusta el stock por la diferencia (cantidad nueva - anterior)
      UPDATE producto
         SET stock = stock + (p_cantidad - v_cantidad_ant)
       WHERE id_producto = v_id_producto
      RETURNING stock INTO v_stock;

      IF v_stock < 0 THEN
          RAISE EXCEPTION 'La actualizacion dejaria el stock en negativo';
      END IF;

      -- actualiza el registro y recalcula el total
      UPDATE registro_inventario
         SET cantidad      = p_cantidad,
             precio_compra = p_precio_compra,
             total         = p_cantidad * p_precio_compra
       WHERE id_registro = p_id_registro;
  END;
  $$;


ALTER PROCEDURE public.actualizar_entrada(IN p_id_registro integer, IN p_cantidad integer, IN p_precio_compra numeric) OWNER TO postgres;

--
-- Name: copiar_descripcion_rol(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.copiar_descripcion_rol() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    SELECT descripcion INTO NEW.rol FROM rol WHERE id_rol = NEW.id_rol;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.copiar_descripcion_rol() OWNER TO postgres;

--
-- Name: dar_baja_producto(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dar_baja_producto(p_id_producto integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id INTEGER;
BEGIN
    UPDATE producto
       SET estado = false
     WHERE id_producto = p_id_producto
    RETURNING id_producto INTO v_id;

    IF v_id IS NULL THEN
        RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
    END IF;

    RETURN v_id;
END;
$$;


ALTER FUNCTION public.dar_baja_producto(p_id_producto integer) OWNER TO postgres;

--
-- Name: descontar_stock(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.descontar_stock(p_id_producto integer, p_cantidad integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
  DECLARE
      v_stock INTEGER;
  BEGIN
      UPDATE producto
         SET stock = stock - p_cantidad
       WHERE id_producto = p_id_producto
      RETURNING stock INTO v_stock;

      IF v_stock IS NULL THEN
          RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
      END IF;

      IF v_stock < 0 THEN
          RAISE EXCEPTION 'Stock insuficiente para el producto %', p_id_producto;
      END IF;

      RETURN v_stock;
  END;
$$;


ALTER FUNCTION public.descontar_stock(p_id_producto integer, p_cantidad integer) OWNER TO postgres;

--
-- Name: registrar_entrada(integer, integer, numeric, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_entrada(IN p_id_producto integer, IN p_cantidad integer, IN p_precio_compra numeric, IN p_id_usuario integer)
    LANGUAGE plpgsql
    AS $$
  BEGIN
      -- sube el stock
      UPDATE producto
         SET stock = stock + p_cantidad
       WHERE id_producto = p_id_producto;

      IF NOT FOUND THEN
          RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
      END IF;

      -- registra el movimiento (trazabilidad / reportes)
      INSERT INTO registro_inventario
          (id_producto, tipo, cantidad, precio_compra, total, id_usuario, fecha)
      VALUES
          (p_id_producto, 'entrada', p_cantidad, p_precio_compra,
           p_cantidad * p_precio_compra, p_id_usuario, NOW());
  END;
  $$;


ALTER PROCEDURE public.registrar_entrada(IN p_id_producto integer, IN p_cantidad integer, IN p_precio_compra numeric, IN p_id_usuario integer) OWNER TO postgres;

--
-- Name: registrar_venta(jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registrar_venta(p_venta jsonb, p_detalles jsonb) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_venta   INTEGER;
    v_id_usuario INTEGER := (p_venta->>'id_usuario')::INT;
    detalle      JSONB;
    v_id_prod    INTEGER;
    v_cantidad   INTEGER;
    v_precio     NUMERIC;
    v_subtotal   NUMERIC;
BEGIN
    -- 1) cabecera de la venta
    INSERT INTO venta
        (id_usuario, tipo_documento, documento_cliente, nombre_cliente,
         monto_pago, monto_cambio, monto_total, fecha)
    VALUES
        (v_id_usuario,
         p_venta->>'tipo_documento',
         p_venta->>'documento_cliente',
         p_venta->>'nombre_cliente',
         (p_venta->>'monto_pago')::NUMERIC,
         (p_venta->>'monto_cambio')::NUMERIC,
         (p_venta->>'monto_total')::NUMERIC,
         NOW())
    RETURNING id_venta INTO v_id_venta;

    -- 2) recorre cada renglon del detalle
    FOR detalle IN SELECT * FROM jsonb_array_elements(p_detalles)
    LOOP
        v_id_prod  := (detalle->>'id_producto')::INT;
        v_cantidad := (detalle->>'cantidad')::INT;
        v_precio   := (detalle->>'precio_venta')::NUMERIC;
        v_subtotal := v_precio * v_cantidad;

        -- 2.a) linea de detalle
        INSERT INTO detalle_venta
            (id_venta, id_producto, precio_venta, cantidad, subtotal, fecha_registro)
        VALUES
            (v_id_venta, v_id_prod, v_precio, v_cantidad, v_subtotal, NOW());

        -- 2.b) descuenta stock (reutiliza la funcion 1, que valida stock)
        PERFORM descontar_stock(v_id_prod, v_cantidad);

        -- 2.c) movimiento de inventario como 'salida'
        INSERT INTO registro_inventario
            (id_producto, tipo, cantidad, total, id_venta, id_usuario, fecha)
        VALUES
            (v_id_prod, 'salida', v_cantidad, v_subtotal, v_id_venta, v_id_usuario, NOW());
    END LOOP;

    RETURN v_id_venta;
END;
$$;


ALTER FUNCTION public.registrar_venta(p_venta jsonb, p_detalles jsonb) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoria (
    id_categoria integer NOT NULL,
    descripcion character varying(100),
    estado boolean
);


ALTER TABLE public.categoria OWNER TO postgres;

--
-- Name: categoria_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categoria_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoria_id_categoria_seq OWNER TO postgres;

--
-- Name: categoria_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categoria_id_categoria_seq OWNED BY public.categoria.id_categoria;


--
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    id_cliente integer NOT NULL,
    dni character varying(20),
    nombre character varying(100),
    correo character varying(100),
    telefono character varying(20),
    estado boolean
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- Name: cliente_id_cliente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cliente_id_cliente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cliente_id_cliente_seq OWNER TO postgres;

--
-- Name: cliente_id_cliente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cliente_id_cliente_seq OWNED BY public.cliente.id_cliente;


--
-- Name: detalle_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_venta (
    id_detalle_venta integer NOT NULL,
    id_venta integer,
    id_producto integer,
    precio_venta numeric(10,2),
    cantidad integer,
    subtotal numeric(10,2),
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.detalle_venta OWNER TO postgres;

--
-- Name: detalle_venta_id_detalle_venta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_venta_id_detalle_venta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_venta_id_detalle_venta_seq OWNER TO postgres;

--
-- Name: detalle_venta_id_detalle_venta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_venta_id_detalle_venta_seq OWNED BY public.detalle_venta.id_detalle_venta;


--
-- Name: permiso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permiso (
    id_permiso integer NOT NULL,
    id_rol integer,
    nombre_menu character varying(100)
);


ALTER TABLE public.permiso OWNER TO postgres;

--
-- Name: permiso_id_permiso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permiso_id_permiso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permiso_id_permiso_seq OWNER TO postgres;

--
-- Name: permiso_id_permiso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permiso_id_permiso_seq OWNED BY public.permiso.id_permiso;


--
-- Name: producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto (
    id_producto integer NOT NULL,
    codigo character varying(50),
    nombre character varying(100),
    descripcion text,
    id_categoria integer,
    stock integer,
    precio_compra numeric(10,2),
    precio_venta numeric(10,2),
    estado boolean
);


ALTER TABLE public.producto OWNER TO postgres;

--
-- Name: producto_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producto_id_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.producto_id_producto_seq OWNER TO postgres;

--
-- Name: producto_id_producto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producto_id_producto_seq OWNED BY public.producto.id_producto;


--
-- Name: registro_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro_inventario (
    id_registro integer NOT NULL,
    id_producto integer NOT NULL,
    tipo character varying(10) NOT NULL,
    cantidad integer NOT NULL,
    id_usuario integer NOT NULL,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    precio_compra numeric(10,2),
    total numeric(10,2),
    id_venta integer,
    CONSTRAINT registro_inventario_cantidad_check CHECK ((cantidad > 0)),
    CONSTRAINT registro_inventario_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['entrada'::character varying, 'salida'::character varying])::text[])))
);


ALTER TABLE public.registro_inventario OWNER TO postgres;

--
-- Name: registro_inventario_id_registro_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registro_inventario_id_registro_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registro_inventario_id_registro_seq OWNER TO postgres;

--
-- Name: registro_inventario_id_registro_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registro_inventario_id_registro_seq OWNED BY public.registro_inventario.id_registro;


--
-- Name: rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol (
    id_rol integer NOT NULL,
    descripcion character varying(100),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rol OWNER TO postgres;

--
-- Name: rol_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rol_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rol_id_rol_seq OWNER TO postgres;

--
-- Name: rol_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rol_id_rol_seq OWNED BY public.rol.id_rol;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    documento character varying(20),
    nombre_completo character varying(100),
    correo character varying(100),
    clave text,
    id_rol integer,
    estado boolean,
    rol character varying(20) DEFAULT 'vendedor'::character varying NOT NULL
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- Name: venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.venta (
    id_venta integer NOT NULL,
    id_usuario integer,
    tipo_documento character varying(50),
    documento_cliente character varying(20),
    nombre_cliente character varying(100),
    monto_pago numeric(10,2),
    monto_cambio numeric(10,2),
    monto_total numeric(10,2),
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.venta OWNER TO postgres;

--
-- Name: venta_id_venta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.venta_id_venta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.venta_id_venta_seq OWNER TO postgres;

--
-- Name: venta_id_venta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.venta_id_venta_seq OWNED BY public.venta.id_venta;


--
-- Name: categoria id_categoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria ALTER COLUMN id_categoria SET DEFAULT nextval('public.categoria_id_categoria_seq'::regclass);


--
-- Name: cliente id_cliente; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente ALTER COLUMN id_cliente SET DEFAULT nextval('public.cliente_id_cliente_seq'::regclass);


--
-- Name: detalle_venta id_detalle_venta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_venta ALTER COLUMN id_detalle_venta SET DEFAULT nextval('public.detalle_venta_id_detalle_venta_seq'::regclass);


--
-- Name: permiso id_permiso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso ALTER COLUMN id_permiso SET DEFAULT nextval('public.permiso_id_permiso_seq'::regclass);


--
-- Name: producto id_producto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto ALTER COLUMN id_producto SET DEFAULT nextval('public.producto_id_producto_seq'::regclass);


--
-- Name: registro_inventario id_registro; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_inventario ALTER COLUMN id_registro SET DEFAULT nextval('public.registro_inventario_id_registro_seq'::regclass);


--
-- Name: rol id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol ALTER COLUMN id_rol SET DEFAULT nextval('public.rol_id_rol_seq'::regclass);


--
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- Name: venta id_venta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta ALTER COLUMN id_venta SET DEFAULT nextval('public.venta_id_venta_seq'::regclass);


--
-- Data for Name: categoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoria (id_categoria, descripcion, estado) FROM stdin;
1	panel	t
4	Paneles Policristalinos	t
5	Inversores	t
6	Controladores de Carga	t
7	Cables y Conectores	t
8	Baterías	t
9	Paneles Monocristalinos	t
10	Estructuras de Montaje	t
2	Policristalino	t
\.


--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (id_cliente, dni, nombre, correo, telefono, estado) FROM stdin;
\.


--
-- Data for Name: detalle_venta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_venta (id_detalle_venta, id_venta, id_producto, precio_venta, cantidad, subtotal, fecha_registro) FROM stdin;
1	3	4	2244.00	2	4488.00	2026-04-21 11:24:15.851525
2	4	4	2244.00	2	4488.00	2026-04-21 15:21:46.099919
3	5	5	12000.00	7	84000.00	2026-04-21 16:49:19.758416
4	6	5	12000.00	3	36000.00	2026-04-22 13:35:41.237808
5	7	4	2244.00	1	2244.00	2026-04-23 10:48:19.446324
6	8	4	2244.00	9	20196.00	2026-04-23 11:05:52.769649
7	9	5	12000.00	7	84000.00	2026-04-23 11:14:25.359071
8	11	4	2244.00	10	22440.00	2026-04-23 11:18:25.042729
9	12	9	25000.00	15	375000.00	2026-04-27 11:16:31.330919
10	12	4	2244.00	1	2244.00	2026-04-27 11:16:31.330919
11	12	6	20000.00	2	40000.00	2026-04-27 11:16:31.330919
12	13	21	165000.00	2	330000.00	2026-06-10 18:54:24.191903
14	16	19	99000.00	1	99000.00	2026-06-10 21:14:00.291366
15	16	16	105000.00	1	105000.00	2026-06-10 21:14:00.291366
16	17	10	123.00	22	2706.00	2026-06-11 10:09:09.974658
17	18	26	80000.00	1	80000.00	2026-06-11 16:26:30.585389
\.


--
-- Data for Name: permiso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permiso (id_permiso, id_rol, nombre_menu) FROM stdin;
1	1	Productos
2	1	Ventas
3	1	Movimientos
4	1	Reportes
5	2	Productos
6	2	Movimientos
7	3	Productos
8	3	Ventas
\.


--
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producto (id_producto, codigo, nombre, descripcion, id_categoria, stock, precio_compra, precio_venta, estado) FROM stdin;
12	\N	Panel Monocristalino 450W	Panel solar monocristalino de 450W, alta eficiencia	9	40	85000.00	120000.00	t
13	\N	Panel Monocristalino 550W	Panel solar monocristalino de 550W, 144 celdas	9	30	110000.00	155000.00	t
14	\N	Panel Monocristalino 600W	Panel solar monocristalino de 600W, uso industrial	9	18	130000.00	180000.00	t
15	\N	Panel Policristalino 330W	Panel solar policristalino de 330W	4	50	60000.00	90000.00	t
17	\N	Inversor On-Grid 5kW	Inversor de conexión a red de 5kW	5	12	250000.00	340000.00	t
18	\N	Inversor Híbrido 3kW	Inversor híbrido 3kW con entrada para baterías	5	15	180000.00	250000.00	t
22	\N	Controlador MPPT 60A	Controlador de carga solar MPPT 60A	6	22	65000.00	95000.00	t
23	\N	Controlador PWM 30A	Controlador de carga solar PWM 30A	6	40	18000.00	28000.00	t
25	\N	Riel de Montaje 2.2m	Riel de aluminio de 2.2m para montaje de paneles	10	100	8000.00	13000.00	t
4	\N	panel	panel	1	19	232.00	2244.00	f
20	\N	Batería de Litio 48V 100Ah	Batería LiFePO4 48V 100Ah para respaldo	8	10	400000.00	560000.00	f
19	\N	Microinversor 600W	Microinversor para 1 o 2 paneles, 600W	5	24	70000.00	99000.00	t
16	\N	Panel Policristalino 400W	Panel solar policristalino de 400W	4	34	75000.00	105000.00	t
6	\N	panel3	panel3	1	106	12000.00	20000.00	t
5	\N	panel2	panel2	1	90	9979.38	12000.00	t
24	\N	Estructura Aluminio 4 Paneles	Estructura de aluminio para montaje de 4 paneles	10	45	45000.00	70000.00	t
10	\N	panel6	panel6	1	0	123.00	123.00	t
26	\N	Cable Solar 6mm Rollo 100m	Cable solar 6mm² en rollo de 100 metros	7	24	55000.00	80000.00	t
27	\N	Conector MC4 Par	Par de conectores MC4 macho y hembra	7	201	1500.00	3000.00	t
21	\N	Batería Gel 12V 200Ah	Batería de gel 12V 200Ah de ciclo profundo	8	48	120000.00	165000.00	t
8	\N	panel4	panel4	1	100	10000.00	30000.00	t
9	\N	panel5	panel5	1	185	4000.00	25000.00	t
\.


--
-- Data for Name: registro_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registro_inventario (id_registro, id_producto, tipo, cantidad, id_usuario, fecha, precio_compra, total, id_venta) FROM stdin;
1	4	entrada	15	2	2026-04-23 10:39:09.172664	\N	\N	\N
2	5	entrada	4	2	2026-04-23 10:39:12.979995	\N	\N	\N
3	4	entrada	5	2	2026-04-23 10:39:18.313843	\N	\N	\N
4	5	entrada	2	2	2026-04-23 10:47:07.364266	9000.00	\N	\N
5	4	salida	1	2	2026-04-23 10:48:19.446324	\N	\N	\N
6	4	salida	9	2	2026-04-23 11:05:52.769649	\N	\N	\N
7	5	salida	7	2	2026-04-23 11:14:25.359071	\N	84000.00	\N
8	4	salida	10	2	2026-04-23 11:18:25.042729	\N	22440.00	11
10	9	salida	15	2	2026-04-27 11:16:31.330919	\N	375000.00	12
11	4	salida	1	2	2026-04-27 11:16:31.330919	\N	2244.00	12
12	6	salida	2	2	2026-04-27 11:16:31.330919	\N	40000.00	12
13	21	salida	2	2	2026-06-10 18:54:24.191903	\N	330000.00	13
14	19	salida	1	2	2026-06-10 21:14:00.291366	\N	99000.00	16
15	16	salida	1	2	2026-06-10 21:14:00.291366	\N	105000.00	16
9	6	entrada	10	2	2026-04-23 11:25:38.848974	12000.00	120000.00	\N
16	24	entrada	15	2	2026-06-11 09:45:39.536169	45000.00	675000.00	\N
17	10	salida	22	2	2026-06-11 10:09:09.974658	\N	2706.00	17
18	26	salida	1	2	2026-06-11 16:26:30.585389	\N	80000.00	18
19	21	entrada	22	2	2026-06-11 16:26:43.474334	120000.00	2640000.00	\N
20	27	entrada	1	2	2026-06-11 16:28:52.01306	1500.00	1500.00	\N
21	21	entrada	1	2	2026-06-11 16:33:53.576591	120000.00	120000.00	\N
22	21	entrada	2	2	2026-06-11 16:37:55.003961	120000.00	240000.00	\N
23	21	entrada	5	2	2026-06-11 17:02:08.472305	120000.00	600000.00	\N
\.


--
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol (id_rol, descripcion, fecha_creacion) FROM stdin;
1	Administrador	2026-04-21 11:23:41.822105
2	OPERADOR_STOCK	2026-06-11 18:27:07.94042
3	VENDEDOR	2026-06-11 18:27:07.94042
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_usuario, documento, nombre_completo, correo, clave, id_rol, estado, rol) FROM stdin;
1	00000001	Admin	admin@zenith.com	admin123	1	t	vendedor
2	\N	\N	gerente@zenith.com	gerente123	\N	t	gerente
4	\N	\N	vendedor@zenith.com	vendedor123	\N	t	vendedor
3	\N	\N	operador@zenith.com	operador123	\N	t	operador_stock
\.


--
-- Data for Name: venta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.venta (id_venta, id_usuario, tipo_documento, documento_cliente, nombre_cliente, monto_pago, monto_cambio, monto_total, fecha) FROM stdin;
3	1	BOLETA	44	matias	4488.00	0.00	4488.00	2026-04-21 11:24:15.851525
4	1	FACTURA	4324	matias	4488.00	0.00	4488.00	2026-04-21 15:21:46.099919
5	1	FACTURA	4343	Matias	84000.00	0.00	84000.00	2026-04-21 16:49:19.758416
6	4	BOLETA	333	gaston	36000.00	0.00	36000.00	2026-04-22 13:35:41.237808
7	2	FACTURA	5454	Matias	2244.00	0.00	2244.00	2026-04-23 10:48:19.446324
8	2	FACTURA	22212	lucas	20196.00	0.00	20196.00	2026-04-23 11:05:52.769649
9	2	BOLETA	4343	Victoria	84000.00	0.00	84000.00	2026-04-23 11:14:25.359071
11	2	FACTURA	4444	Marcos	22440.00	0.00	22440.00	2026-04-23 11:18:25.042729
12	2	FACTURA	4343	Matias	417244.00	0.00	417244.00	2026-04-27 11:16:31.330919
13	2	Boleta	20-12345678-9	Cliente Prueba API	350000.00	20000.00	330000.00	2026-06-10 18:54:24.191903
16	2	BOLETA	43274276	MAtias LAgo	204000.00	0.00	204000.00	2026-06-10 21:14:00.291366
17	2	BOLETA	434334	Luis Luis	2706.00	0.00	2706.00	2026-06-11 10:09:09.974658
18	2	BOLETA	4353453	miguel sanchez	80000.00	0.00	80000.00	2026-06-11 16:26:30.585389
\.


--
-- Name: categoria_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categoria_id_categoria_seq', 10, true);


--
-- Name: cliente_id_cliente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cliente_id_cliente_seq', 1, false);


--
-- Name: detalle_venta_id_detalle_venta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_venta_id_detalle_venta_seq', 17, true);


--
-- Name: permiso_id_permiso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permiso_id_permiso_seq', 8, true);


--
-- Name: producto_id_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producto_id_producto_seq', 27, true);


--
-- Name: registro_inventario_id_registro_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registro_inventario_id_registro_seq', 23, true);


--
-- Name: rol_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rol_id_rol_seq', 1, true);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 4, true);


--
-- Name: venta_id_venta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.venta_id_venta_seq', 18, true);


--
-- Name: categoria categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria);


--
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente);


--
-- Name: detalle_venta detalle_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_pkey PRIMARY KEY (id_detalle_venta);


--
-- Name: permiso permiso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso
    ADD CONSTRAINT permiso_pkey PRIMARY KEY (id_permiso);


--
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (id_producto);


--
-- Name: registro_inventario registro_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_inventario
    ADD CONSTRAINT registro_inventario_pkey PRIMARY KEY (id_registro);


--
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id_rol);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: venta venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT venta_pkey PRIMARY KEY (id_venta);


--
-- Name: ux_categoria_descripcion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_categoria_descripcion ON public.categoria USING btree (lower((descripcion)::text));


--
-- Name: ux_producto_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_producto_nombre ON public.producto USING btree (lower((nombre)::text));


--
-- Name: usuario trg_copiar_descripcion_rol; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_copiar_descripcion_rol BEFORE INSERT OR UPDATE ON public.usuario FOR EACH ROW EXECUTE FUNCTION public.copiar_descripcion_rol();


--
-- Name: detalle_venta detalle_venta_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- Name: detalle_venta detalle_venta_id_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.venta(id_venta);


--
-- Name: permiso permiso_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso
    ADD CONSTRAINT permiso_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol);


--
-- Name: producto producto_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categoria(id_categoria);


--
-- Name: registro_inventario registro_inventario_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_inventario
    ADD CONSTRAINT registro_inventario_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- Name: registro_inventario registro_inventario_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_inventario
    ADD CONSTRAINT registro_inventario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- Name: registro_inventario registro_inventario_id_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_inventario
    ADD CONSTRAINT registro_inventario_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.venta(id_venta);


--
-- Name: usuario usuario_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol);


--
-- Name: venta venta_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT venta_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- PostgreSQL database dump complete
--

\unrestrict ATgClRmtanUI3oVUXBanCmabDwaVpxteMchm8xtR6sPgepskHMTnlyPzptpC8wX

