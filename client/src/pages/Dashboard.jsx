import { useNavigate } from 'react-router-dom';

const ROLES_LABELS = {
    gerente: 'Gerente',
    operador_stock: 'Operador de Stock',
    vendedor: 'Vendedor',
};

const MODULOS = [
    {
        id: 'productos',
        titulo: 'Administrar Productos',
        descripcion: 'Consultá, agregá, modificá y eliminá productos del inventario.',
        ruta: '/productos',
        roles: ['gerente', 'operador_stock', 'vendedor'],
        icono: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
        ),
    },
    {
        id: 'ventas',
        titulo: 'Ventas',
        descripcion: 'Registrá nuevas ventas y consultá el historial de movimientos.',
        ruta: '/ventas',
        roles: ['gerente', 'vendedor'],
        icono: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
        ),
    },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const rol = localStorage.getItem('rol');
    const modulos = MODULOS.filter(m => m.roles.includes(rol));

    return (
        <div className="min-h-[calc(100vh-52px)] bg-bb-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-bb-900">Panel de Control</h1>
                    <p className="text-sm text-bb-500 mt-1">
                        Rol: <span className="font-medium text-bb-700">{ROLES_LABELS[rol] ?? rol}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {modulos.map(m => (
                        <button
                            key={m.id}
                            onClick={() => navigate(m.ruta)}
                            className="group bg-white border border-bb-100 rounded-xl p-6 text-left shadow-sm hover:shadow-md hover:border-bb-300 transition-all"
                        >
                            <div className="text-bb-600 mb-4 group-hover:text-bb-800 transition-colors">
                                {m.icono}
                            </div>
                            <h2 className="text-base font-semibold text-bb-900 mb-1">{m.titulo}</h2>
                            <p className="text-sm text-bb-500">{m.descripcion}</p>
                            <span className="inline-block mt-4 text-xs font-medium text-bb-600 group-hover:text-bb-800 transition-colors">
                                Ir a {m.titulo} →
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
