
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { getUsers, type User } from '../services/user.service';
import { uploadKyc } from '../services/kyc.service';
import { X } from 'lucide-react';

import KycCapture from '../components/KycCapture';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    // User Management State
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token) {
            navigate('/login');
            return;
        }

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        fetchUsers();
    }, [navigate, page, search]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers(page, 5, search);
            setUsers(data.users);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'rejected' | null>(null);
    const [kycFiles, setKycFiles] = useState<{ image: File | null, video: File | null }>({ image: null, video: null });
    const [uploading] = useState(false);

    // Update useEffect to check KYC status
    useEffect(() => {
        if (user && user.kyc?.status) {
            setKycStatus(user.kyc.status);
        }
    }, [user]);

    const handleKycCapture = async (file: File, type: 'image' | 'video') => {
        setKycFiles(prev => ({ ...prev, [type]: file }));
        console.log("kycFiles: ",kycFiles);
        const toastId = toast.loading(`Uploading ${type}...`);
        try {
            let response;
            if (type === 'image') {
                response = await uploadKyc(file, null);
            } else {
                response = await uploadKyc(null, file);
            }

            toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`, { id: toastId });

            if (response && response.user) {
                const updatedUser = response.user;
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                console.log("kyc status: ", kycStatus);
                if (updatedUser.kyc?.status === 'pending') {
                    setKycStatus('pending');
                }
            }

        } catch (error) {
            console.error(error);
            toast.error(`Failed to upload ${type}`, { id: toastId });
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h1 style={{ margin: 0, color: "#aef705ff" }}>Dashboard</h1>
                {user && <h2>Welcome {user.name}</h2>}
                <div>
                    <Button onClick={handleLogoutClick} style={{ backgroundColor: '#ff4444', color: 'white' }}>
                        Logout
                    </Button>
                </div>
            </header>

            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Confirm Logout"
                footer={
                    <>
                        <Button onClick={() => setShowLogoutModal(false)} variant="secondary">Cancel</Button>
                        <Button onClick={confirmLogout} style={{ backgroundColor: '#ff4444', color: 'white' }}>Logout</Button>
                    </>
                }
            >
                <p>Are you sure you want to log out?</p>
            </Modal>

            <div className="dashboard-content">
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>KYC Verification</h3>

                    {/* {kycStatus === 'pending' ? (
                        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(255, 255, 0, 0.1)', border: '1px solid yellow', borderRadius: '8px' }}>
                            <h3>Verification Pending</h3>
                            <p>Your documents are under review. You cannot submit again at this time.</p>
                        </div>
                    ) : kycStatus === 'verified' ? (
                        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(0, 255, 0, 0.1)', border: '1px solid green', borderRadius: '8px' }}>
                            <h3>Verified</h3>
                            <p>Your KYC is complete.</p>
                        </div>
                    ) : ( */}
                    <div>
                        {/* Derive uploaded state from USER object, not local kycFiles state which resets on refresh */}
                        {/* {user?.kyc?.imageUrl ? <p style={{ color: 'green' }}>Image Uploaded ✅</p> : <p>Please capture an Image</p>}
                            {user?.kyc?.videoUrl ? <p style={{ color: 'green' }}>Video Uploaded ✅</p> : <p>Please record a Video</p>} */}

                        <KycCapture
                            onCapture={handleKycCapture}
                            isImageUploaded={!!user?.kyc?.imageUrl}
                            isVideoUploaded={!!user?.kyc?.videoUrl}
                        />

                        {uploading && <p>Uploading...</p>}
                    </div>
                    {/* )}  */}
                </div>

                <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>Users</h3>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <input
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search by name or email..."
                        style={{ width: '100%', paddingRight: '2.5rem' }}
                    />
                    {search && (
                        <X
                            onClick={() => setSearch('')}
                            style={{
                                position: 'absolute',
                                right: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#ccc'
                            }}
                        />
                    )}
                </div>
                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#333', color: 'white', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem' }}>Name</th>
                                    <th style={{ padding: '0.75rem' }}>Email</th>
                                    {/* <th style={{ padding: '0.75rem' }}>ID</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid #444' }}>
                                            <td style={{ padding: '0.75rem' }}>{user.name}</td>
                                            <td style={{ padding: '0.75rem' }}>{user.email}</td>
                                            {/* <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{user._id}</td> */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} style={{ padding: '1rem', textAlign: 'center' }}>No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'end', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                    <Button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        style={{ width: 'auto', padding: '0.5rem 1rem' }}
                    >
                        Previous
                    </Button>
                    <span style={{paddingTop:"12px"}}>Page {page} of {totalPages}</span>
                    <Button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                        style={{ width: 'auto', padding: '0.5rem 1rem' }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
