import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Save, Lock, Database, Store, MessageCircle, Clock } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('shop');
    const [loading, setLoading] = useState(false);

    // Config State
    const [shopDetails, setShopDetails] = useState({
        shopName: '',
        address: '',
        phone: '',
        gst: ''
    });

    const [whatsAppConfig, setWhatsAppConfig] = useState({
        invoiceTemplate: "Thank you for shopping at {shop_name}. Your bill amount is Rs. {amount}. Link: {link}",
        birthdayTemplate: "Happy Birthday {customer_name}! Wishing you clarity and vision from {shop_name}.",
        recallTemplate: "Hello {customer_name}, it's time for your eye checkup at {shop_name}."
    });

    const [recallDays, setRecallDays] = useState('365');

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await api.get('/settings');
            const settingsMap: any = {};
            response.data.forEach((s: any) => settingsMap[s.key] = s.value);

            if (settingsMap.shop_name) setShopDetails(prev => ({ ...prev, shopName: settingsMap.shop_name }));
            if (settingsMap.address) setShopDetails(prev => ({ ...prev, address: settingsMap.address }));
            if (settingsMap.phone) setShopDetails(prev => ({ ...prev, phone: settingsMap.phone }));
            if (settingsMap.gst) setShopDetails(prev => ({ ...prev, gst: settingsMap.gst }));

            if (settingsMap.whatsapp_invoice) setWhatsAppConfig(prev => ({ ...prev, invoiceTemplate: settingsMap.whatsapp_invoice }));
            if (settingsMap.whatsapp_birthday) setWhatsAppConfig(prev => ({ ...prev, birthdayTemplate: settingsMap.whatsapp_birthday }));
            if (settingsMap.whatsapp_recall) setWhatsAppConfig(prev => ({ ...prev, recallTemplate: settingsMap.whatsapp_recall }));

            if (settingsMap.recall_days) setRecallDays(settingsMap.recall_days);

        } catch (error) {
            console.error("Failed to load settings", error);
            // toast.error("Failed to load settings"); // Suppress on first load if empty
        }
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            const settingsToSave = [
                { key: 'shop_name', value: shopDetails.shopName },
                { key: 'address', value: shopDetails.address },
                { key: 'phone', value: shopDetails.phone },
                { key: 'gst', value: shopDetails.gst },
                { key: 'whatsapp_invoice', value: whatsAppConfig.invoiceTemplate },
                { key: 'whatsapp_birthday', value: whatsAppConfig.birthdayTemplate },
                { key: 'whatsapp_recall', value: whatsAppConfig.recallTemplate },
                { key: 'recall_days', value: recallDays }
            ];

            await api.post('/settings', settingsToSave);
            toast.success("Settings saved successfully");
        } catch (error) {
            console.error("Failed to save settings", error);
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match");
            return;
        }
        if (passwords.new.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            await api.post('/auth/change-password', {
                current_password: passwords.current,
                new_password: passwords.new
            });
            toast.success("Password changed successfully");
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to change password");
        }
    };

    const downloadBackup = async () => {
        try {
            const response = await api.get('/settings/backup', { responseType: 'blob' });
            const blob = new Blob([response.data]);
            const filename = `backup_${new Date().toISOString().slice(0, 10)}.db`;

            // Try to use the File System Access API for a "Save As" dialog
            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: filename,
                        types: [{
                            description: 'Database File',
                            accept: { 'application/x-sqlite3': ['.db'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    toast.success("Backup saved successfully");
                    return;
                } catch (err: any) {
                    // Fail silently if user cancelled picker
                    if (err.name === 'AbortError') return;
                    // Otherwise fall back to default download
                    console.warn("File System Access API failed, falling back to download", err);
                }
            }

            // Fallback: Automatic download via anchor tag
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Backup failed", error);
            toast.error("Failed to download backup");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your store configuration</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2">
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'shop' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    >
                        <Store className="w-5 h-5" />
                        <span className="font-medium">Shop Details</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('whatsapp')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'whatsapp' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">WhatsApp</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'config' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    >
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Configuration</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'security' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    >
                        <Lock className="w-5 h-5" />
                        <span className="font-medium">Security</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('backup')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'backup' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    >
                        <Database className="w-5 h-5" />
                        <span className="font-medium">Backup</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-card rounded-xl shadow-md p-6">
                    {/* Shop Details */}
                    {activeTab === 'shop' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold mb-4">Shop Details</h2>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Shop Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={shopDetails.shopName}
                                        onChange={e => setShopDetails(prev => ({ ...prev, shopName: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Address</label>
                                    <textarea
                                        className="input-field min-h-[80px]"
                                        value={shopDetails.address}
                                        onChange={e => setShopDetails(prev => ({ ...prev, address: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={shopDetails.phone}
                                        onChange={e => setShopDetails(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">GST/Registration No</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={shopDetails.gst}
                                        onChange={e => setShopDetails(prev => ({ ...prev, gst: e.target.value }))}
                                    />
                                </div>
                                <button onClick={saveSettings} disabled={loading} className="btn-primary w-fit mt-2">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* WhatsApp */}
                    {activeTab === 'whatsapp' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold mb-4">WhatsApp Templates</h2>
                            <div>
                                <label className="block text-sm font-medium mb-1">Invoice Message</label>
                                <p className="text-xs text-muted-foreground mb-1">Variables: {'{shop_name}, {amount}, {link}, {customer_name}'}</p>
                                <textarea
                                    className="input-field min-h-[80px]"
                                    value={whatsAppConfig.invoiceTemplate}
                                    onChange={e => setWhatsAppConfig(prev => ({ ...prev, invoiceTemplate: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Birthday Message</label>
                                <p className="text-xs text-muted-foreground mb-1">Variables: {'{shop_name}, {customer_name}'}</p>
                                <textarea
                                    className="input-field min-h-[80px]"
                                    value={whatsAppConfig.birthdayTemplate}
                                    onChange={e => setWhatsAppConfig(prev => ({ ...prev, birthdayTemplate: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Recall Message</label>
                                <p className="text-xs text-muted-foreground mb-1">Variables: {'{shop_name}, {customer_name}'}</p>
                                <textarea
                                    className="input-field min-h-[80px]"
                                    value={whatsAppConfig.recallTemplate}
                                    onChange={e => setWhatsAppConfig(prev => ({ ...prev, recallTemplate: e.target.value }))}
                                />
                            </div>
                            <button onClick={saveSettings} disabled={loading} className="btn-primary w-fit mt-2">
                                <Save className="w-4 h-4 mr-2" />
                                Save Templates
                            </button>
                        </div>
                    )}

                    {/* Configuration */}
                    {activeTab === 'config' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold mb-4">General Configuration</h2>
                            <div>
                                <label className="block text-sm font-medium mb-1">Default Recall Period (Days)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={recallDays}
                                    onChange={e => setRecallDays(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Days after sale to trigger recall alert</p>
                            </div>
                            <button onClick={saveSettings} disabled={loading} className="btn-primary w-fit mt-2">
                                <Save className="w-4 h-4 mr-2" />
                                Save Configuration
                            </button>
                        </div>
                    )}


                    {/* Security */}
                    {activeTab === 'security' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold mb-4">Security</h2>
                            <div className="p-4 bg-accent/30 rounded-lg border border-border">
                                <h3 className="font-semibold mb-4">Change Admin Password</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={passwords.current}
                                            onChange={e => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">New Password</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={passwords.new}
                                            onChange={e => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={passwords.confirm}
                                            onChange={e => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                        />
                                    </div>
                                    <button onClick={changePassword} className="btn-primary w-fit mt-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Backup */}
                    {activeTab === 'backup' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold mb-4">Database Backup</h2>
                            <p className="text-muted-foreground mb-4">
                                Download a backup of your entire database. It is recommended to do this regularly to prevent data loss.
                            </p>
                            <button onClick={downloadBackup} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                <Database className="w-4 h-4" />
                                Download Backup
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Settings;
