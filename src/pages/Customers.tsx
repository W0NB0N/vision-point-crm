import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Customer } from '@/types';
import { Eye, Search, UserPlus } from 'lucide-react';

const Customers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        if (search) {
            setFilteredCustomers(
                customers.filter(c =>
                    c.name.toLowerCase().includes(search.toLowerCase()) ||
                    c.phone.includes(search)
                )
            );
        } else {
            setFilteredCustomers(customers);
        }
    }, [search, customers]);

    const loadCustomers = async () => {
        try {
            const response = await api.get('/customers', { params: { limit: 1000 } });
            setCustomers(response.data);
            setFilteredCustomers(response.data);
        } catch (error) {
            console.error("Failed to load customers", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Customers</h1>
                    <p className="text-muted-foreground mt-1">Manage and view all customer records</p>
                </div>
                <button
                    onClick={() => navigate('/add-customer')}
                    className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <UserPlus className="w-4 h-4" />
                    Add Customer
                </button>
            </div>

            <div className="bg-card rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-9"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-accent/30">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold">Name</th>
                                <th className="p-4 text-left text-sm font-semibold">Phone</th>
                                <th className="p-4 text-left text-sm font-semibold">Age/Gender</th>
                                <th className="p-4 text-left text-sm font-semibold">City/Notes</th>
                                <th className="p-4 text-center text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No customers found
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="border-t border-border table-row-hover">
                                        <td className="p-4 font-medium">{customer.name}</td>
                                        <td className="p-4 text-sm text-muted-foreground">{customer.phone}</td>
                                        <td className="p-4 text-sm">
                                            {customer.age
                                                ? `${customer.age} Y`
                                                : customer.dob
                                                    ? `${new Date().getFullYear() - new Date(customer.dob).getFullYear()} Y`
                                                    : '-'
                                            } / {customer.gender}
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                                            {customer.notes || '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => navigate(`/customers/${customer.id}`)}
                                                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Customers;
