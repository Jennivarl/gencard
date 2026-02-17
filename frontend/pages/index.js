import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import Head from "next/head";

const ROLES = ["neuron", "synapse intern", "synapse", "brain intern", "brain", "singularity"];
const ROLE_COLORS = { neuron: "#C7B0FB", "synapse intern": "#FDE1F0", synapse: "#FBCFE8", "brain intern": "#FEF3C7", brain: "#FDE68A", singularity: "#A7F3D0" };

export default function Home() {
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [photo, setPhoto] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCard, setShowCard] = useState(false);
    const cardRef = useRef(null);
    const fileInputRef = useRef(null);

    function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhoto(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    }


    async function handleDownload() {
        if (!cardRef.current) return;
        try {
            // Temporarily bypass mobile styles for full-size capture
            const container = cardRef.current;
            container.classList.add('capturing');

            // Wait for style application
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(container, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                useCORS: true,
                width: 500,
                height: 355
            });

            // Remove bypass class
            container.classList.remove('capturing');

            // Check if mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile && navigator.share) {
                // Use JPEG for mobile (Photos app recognition)
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], `${name || 'card'}-${role || 'card'}.jpg`, { type: 'image/jpeg' });
                    const nickname = result?.nickname ? ` aka "${result.nickname}"` : '';
                    const shareText = `🎉 ${name}${nickname} just got verified as a ${role}! Check out my GenFren card 🚀`;

                    try {
                        await navigator.share({
                            files: [file],
                            title: `${name}'s GenFren Card`,
                            text: shareText
                        });
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            downloadImage(canvas, 'jpg');
                        }
                    }
                }, 'image/jpeg', 0.95);
            } else {
                // Desktop or Share not supported - use appropriate format
                downloadImage(canvas, isMobile ? 'jpg' : 'png');
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to process card. Please try again.');
        }
    }

    function downloadImage(canvas, format = 'png') {
        const link = document.createElement('a');
        link.download = `${name || 'card'}-${role || 'card'}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.95 : undefined);
        link.click();
    }

    async function handleVerify() {
        if (!name || !role || !photo) {
            alert("Please enter your name, select a role, and upload a photo");
            return;
        }
        setShowCard(true); // Show the generated card
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/verify-genlayer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, role }) });
            const j = await res.json();

            if (res.status === 501) {
                const mock = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, role }) });
                const mj = await mock.json();
                setResult(mj);
            } else if (!res.ok) {
                const mock = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, role }) });
                const mj = await mock.json();
                setResult(mj);
            } else {
                if (j && j.success && j.data) {
                    setResult(j.data);
                } else {
                    setResult(j);
                }
            }
        } catch (e) {
            try {
                const mock = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, role }) });
                const mj = await mock.json();
                setResult(mj);
            } catch (_) {
                setResult({ verified: false, verdict: 'REJECTED', reason: 'Network error' });
            }
        }
        setLoading(false);
    }

    const roleToFile = {
        'neuron': 'neuron',
        'synapse intern': 'synapse',
        'synapse': 'synapse-intern',
        'brain intern': 'brain-intern',
        'brain': 'brain',
        'singularity': 'singularity'
    };
    const fileName = role ? roleToFile[role] : 'neuron';
    const cardImageUrl = `/${fileName}.png`;

    const framePositions = {
        'neuron': { photoTop: 50, photoLeft: 120, photoWidth: 152, photoHeight: 152, nameTop: 211, nameLeft: 183 },
        'synapse intern': { photoTop: 50, photoLeft: 120, photoWidth: 152, photoHeight: 152, nameTop: 211, nameLeft: 183 },
        'synapse': { photoTop: 50, photoLeft: 120, photoWidth: 152, photoHeight: 152, nameTop: 211, nameLeft: 183 },
        'brain intern': { photoTop: 50, photoLeft: 120, photoWidth: 152, photoHeight: 152, nameTop: 211, nameLeft: 183 },
        'brain': { photoTop: 50, photoLeft: 120, photoWidth: 152, photoHeight: 152, nameTop: 211, nameLeft: 183 },
        'singularity': { photoTop: 50, photoLeft: 120, photoWidth: 152, photoHeight: 152, nameTop: 211, nameLeft: 183 }
    };
    const framePos = role ? framePositions[role] : framePositions['neuron'];

    return (
        <>
            <Head>
                <title>GenCard - AI-Powered Verification Cards | Powered by GenLayer</title>
                <meta name="description" content="Create your verified GenCard using GenLayer's intelligent contracts. AI-powered verification with blockchain consensus." />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://gencard-ai.vercel.app/" />
                <meta property="og:title" content="GenCard - AI-Powered Verification Cards" />
                <meta property="og:description" content="Create your verified GenCard using GenLayer's intelligent contracts. Get verified by 5 AI validators with blockchain consensus!" />
                <meta property="og:image" content="https://gencard-ai.vercel.app/background.png" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://gencard-ai.vercel.app/" />
                <meta property="twitter:title" content="GenCard - AI-Powered Verification Cards" />
                <meta property="twitter:description" content="Create your verified GenCard using GenLayer's intelligent contracts. Get verified by 5 AI validators!" />
                <meta property="twitter:image" content="https://gencard-ai.vercel.app/background.png" />

                {/* WhatsApp */}
                <meta property="og:site_name" content="GenCard" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
            </Head>
            <style jsx global>{`
                * {
                    scroll-behavior: auto !important;
                    transition: none !important;
                    animation: none !important;
                    animation-duration: 0s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0s !important;
                    transition-delay: 0s !important;
                }
                @media (max-width: 768px) {
                    html, body {
                        overflow: hidden;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        position: fixed;
                        width: 100%;
                        overscroll-behavior: none;
                        -webkit-overflow-scrolling: auto;
                        touch-action: manipulation;
                        * {
                            transition: none !important;
                            animation: none !important;
                            -webkit-overflow-scrolling: auto !important;
                        }
                        html, body {
                            overscroll-behavior: none !important;
                            touch-action: manipulation !important;
                            position: fixed !important;
                            overflow: hidden !important;
                        }
                        main {
                            flex-direction: column !important;
                            padding-top: 300px !important;
                            padding-bottom: 20px !important;
                            padding-left: 20px !important;
                            padding-right: 20px !important;
                            gap: 0 !important;
                            align-items: center !important;
                            justify-content: flex-start !important;
                            position: fixed !important;
                            overflow: hidden !important;
                            overscroll-behavior: none !important;
                        }
                    }
                    .modal-overlay {
                        display: block !important;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 0 !important;
                        background: rgba(0, 0, 0, 0.85) !important;
                        z-index: 1000 !important;
                    }
                    .card-container:not(.capturing) {
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 220px !important;
                        height: 156px !important;
                        margin: 0 !important;
                        z-index: 1001 !important;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
                        border-radius: 8px !important;
                    }
                    .card-container > img {
                        border-radius: 8px !important;
                    }
                    .card-container.capturing {
                        position: fixed !important;
                        top: 0 !important;
                        left: -9999px !important;
                        width: 500px !important;
                        height: 355px !important;
                        transform: none !important;
                        z-index: 9999 !important;
                        opacity: 1 !important;
                        pointer-events: none !important;
                    }
                    .card-container:not(.capturing) div:not(.close-modal-btn) {
                        font-size: 6px !important;
                        letter-spacing: 0.2px !important;
                    }
                    .card-container.capturing div:not(.close-modal-btn) {
                        font-size: 14px !important;
                        letter-spacing: 0.5px !important;
                    }
                    .close-modal-btn {
                        display: flex !important;
                        font-size: 20px !important;
                        letter-spacing: normal !important;
                    }
                    .modal-buttons {
                        display: flex !important;
                    }
                    .desktop-card-buttons {
                        display: none !important;
                    }
                    .desktop-verified-result {
                        display: none !important;
                    }
                    .modal-verified-result {
                        display: block !important;
                    }
                    .card-container::after {
                        content: 'Tap ✕ to close' !important;
                        position: absolute !important;
                        bottom: -35px !important;
                        left: 50% !important;
                        transform: translateX(-50%) !important;
                        color: #fff !important;
                        font-size: 12px !important;
                        white-space: nowrap !important;
                        text-align: center !important;
                        font-family: system-ui, sans-serif !important;
                    }
                    .form-section {
                        max-width: 240px !important;
                        margin-left: 59px !important;
                        margin-top: 40px !important;
                        margin-right: auto !important;
                        position: relative !important;
                        transform: none !important;
                    }
                    .form-section, .form-section * {
                        transition: none !important;
                        animation: none !important;
                    }
                    .form-section label {
                        margin-top: 10px !important;
                        font-size: 12px !important;
                    }
                    input, select {
                        padding: 7px !important;
                        font-size: 13px !important;
                    }
                    button {
                        padding: 9px 14px !important;
                        font-size: 13px !important;
                    }
                }
                
                /* Form styling */
                .form-section {
                    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Bradley Hand', cursive !important;
                }
                .label-photo::before {
                    content: '📸 ';
                    margin-right: 4px;
                }
                .label-name::before {
                    content: '🧡 ';
                    margin-right: 4px;
                }
                .label-role::before {
                    content: '🍀 ';
                    margin-right: 4px;
                }
                .reset-button {
                    background-color: #ff66c4 !important;
                    color: white !important;
                }
                .reset-button:hover {
                    background-color: #ff4db8 !important;
                }
                input[type="file"] {
                    background-color: #ffd700 !important;
                    border: 2px solid #ffb700 !important;
                    font-weight: 600 !important;
                }
                input[type="file"]::-webkit-file-upload-button {
                    background-color: #ffb700 !important;
                    color: #000 !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 6px !important;
                    cursor: pointer !important;
                    font-weight: 600 !important;
                    margin-right: 10px !important;
                }
                input[type="file"]::-webkit-file-upload-button:hover {
                    background-color: #ffa500 !important;
                }
                
                /* Desktop styles - hide mobile elements and prevent scrolling */
                @media (min-width: 769px) {
                    html, body {
                        overflow: hidden !important;
                        height: 100% !important;
                        position: fixed !important;
                        width: 100% !important;
                        overscroll-behavior: none !important;
                    }
                    .modal-overlay, .modal-buttons, .modal-verified-result, .close-modal-btn {
                        display: none !important;
                    }
                    .desktop-card-buttons {
                        display: flex !important;
                    }
                    .desktop-verified-result {
                        display: block !important;
                    }
                    .card-container::after {
                        display: none !important;
                    }
                    .card-wrapper {
                        display: flex !important;
                    }
                    .form-section {
                        margin-left: -120px !important;
                        margin-top: 240px !important;
                        margin-right: 0 !important;
                    }
                }
                
                /* Mobile - card wrapper doesn't use flexbox */
                @media (max-width: 768px) {
                    .card-wrapper {
                        display: block !important;
                    }
                }
            `}</style>
            <main style={{ position: 'relative', height: '100vh', width: '100vw', background: 'transparent', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 120, padding: '60px 40px', fontFamily: 'system-ui,Segoe UI,Roboto', margin: 0, overflow: 'hidden' }}>

                {/* Card Preview - Only shown after clicking Verify */}
                {showCard && (
                    <div className="card-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <>
                            {/* Mobile modal overlay */}
                            <div className="modal-overlay" onClick={() => setShowCard(false)} style={{ display: 'none' }}></div>

                            <aside ref={cardRef} className="card-container" style={{ position: 'relative', width: 500, height: 355, flexShrink: 0 }}>
                                {/* Close button for mobile modal */}
                                <div onClick={() => setShowCard(false)} className="close-modal-btn" style={{ position: 'absolute', top: -35, right: 0, width: 30, height: 30, display: 'none', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '50%', cursor: 'pointer', fontSize: 20, fontWeight: 'bold', zIndex: 1002 }}>×</div>

                                <img src={cardImageUrl} alt={role || 'card'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

                                {/* Uploaded Photo in large frame */}
                                {photo && (
                                    <div style={{ position: 'absolute', top: '14.08%', left: '24%', width: '30.4%', height: '42.8%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={photo} alt="uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}

                                {/* Name in small NAME: frame */}
                                {name && (
                                    <div style={{ position: 'absolute', top: '59.4%', left: '36.6%', fontSize: 14, fontWeight: 900, fontFamily: 'Georgia, serif', color: '#000', letterSpacing: '0.5px', textAlign: 'left', maxWidth: '22%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {name}
                                    </div>
                                )}
                            </aside>

                            {/* Verified Result in Modal */}
                            {result && (
                                <div className="modal-verified-result" style={{ display: 'none', position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)', width: '85%', maxWidth: '280px', padding: 14, backgroundColor: result.verified ? '#d4edda' : '#f8d7da', borderRadius: 8, border: `2px solid ${result.verified ? '#28a745' : '#dc3545'}`, zIndex: 1001, textAlign: 'center' }}>
                                    <strong style={{ display: 'block', fontSize: 15 }}>{result.verified ? '✓ Verified!' : '✗ Rejected'}</strong>
                                    {result.nickname && (
                                        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 700, fontFamily: 'Georgia, serif', fontStyle: 'italic', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 4px rgba(0,0,0,0.1)', letterSpacing: '0.5px' }}>aka "{result.nickname}"</div>
                                    )}
                                    <div style={{ marginTop: 6, fontSize: 12, wordWrap: 'break-word', lineHeight: '1.4' }}>
                                        {result.reason || result.verdict}
                                        {!result.verified && <span style={{ display: 'block', marginTop: 4, fontWeight: 600 }}>Please correct and try again.</span>}
                                    </div>
                                </div>
                            )}

                            {/* Mobile modal buttons */}
                            <div className="modal-buttons" style={{ display: 'none', position: 'fixed', bottom: '15%', left: '50%', transform: 'translateX(-50%)', width: '85%', maxWidth: '280px', gap: 12, zIndex: 1002 }}>
                                <button onClick={handleDownload} style={{ flex: 1, padding: '12px 24px', fontSize: 15, fontWeight: 600, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                    Save Card
                                </button>
                                <button onClick={() => {
                                    if (!result?.nickname) return;
                                    const tweetText = `🎉 I just got verified as ${role} aka "${result.nickname}"! Check out GenFren powered by @genLayer 🚀\n\n`;
                                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                                }} style={{ flex: 1, padding: '12px 24px', fontSize: 15, fontWeight: 600, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                    Share to 𝕏
                                </button>
                            </div>

                            {/* Desktop buttons - below card */}
                            <div className="desktop-card-buttons" style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
                                <button onClick={handleDownload} style={{ padding: '12px 24px', fontSize: 16, fontWeight: 600, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                                    Save Card
                                </button>
                                <button onClick={() => {
                                    if (!result?.nickname) return;
                                    const tweetText = `🎉 I just got verified as ${role} aka "${result.nickname}"! Check out GenFren powered by @genLayer 🚀\n\n`;
                                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                                }} style={{ padding: '12px 24px', fontSize: 16, fontWeight: 600, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                                    Share to 𝕏
                                </button>
                            </div>

                            {/* Verification result for desktop - above card */}
                            {result && (
                                <div className="desktop-verified-result" style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', padding: 16, backgroundColor: result.verified ? '#d4edda' : '#f8d7da', borderRadius: 8, border: `2px solid ${result.verified ? '#28a745' : '#dc3545'}`, maxWidth: '450px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <strong style={{ display: 'block', fontSize: 16 }}>{result.verified ? '✓ Verified!' : '✗ Rejected'}</strong>
                                    {result.nickname && (
                                        <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, fontFamily: 'Georgia, serif', fontStyle: 'italic', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 4px rgba(0,0,0,0.1)', letterSpacing: '0.5px' }}>aka "{result.nickname}"</div>
                                    )}
                                    <div style={{ marginTop: 8, fontSize: 13, wordWrap: 'break-word', lineHeight: '1.4' }}>
                                        {result.reason || result.verdict}
                                        {!result.verified && <span style={{ display: 'block', marginTop: 6, fontWeight: 600 }}>Please correct and try again.</span>}
                                    </div>
                                </div>
                            )}
                        </>
                    </div>
                )}

                {/* Form */}
                <section className="form-section" style={{ maxWidth: 520, textAlign: 'left' }}>
                    <label className="label-photo" style={{ display: 'block', marginTop: 12, fontWeight: 600 }}>Upload Photo</label>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ width: '100%', padding: 8, fontSize: 14, borderRadius: 8 }} />

                    <label className="label-name" style={{ display: 'block', marginTop: 20, fontWeight: 600 }}>Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name ✨" style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '2px solid #ddd' }} />

                    <label className="label-role" style={{ display: 'block', marginTop: 20, fontWeight: 600 }}>Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '2px solid #ddd' }}>
                        <option value="">Select role 🚀</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>

                    <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                        <button onClick={handleVerify} disabled={loading} style={{ flex: 1, padding: '12px 20px', fontSize: 16, fontWeight: 600, backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                            {loading ? 'Verifying... 🔄' : 'Verify & Generate ✨'}
                        </button>
                        <button className="reset-button" onClick={() => { setName(''); setRole(''); setPhoto(null); setResult(null); setShowCard(false); if (fileInputRef.current) fileInputRef.current.value = '' }} style={{ padding: '12px 20px', fontSize: 16, border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                            Reset 🔄
                        </button>
                    </div>
                </section>
            </main>
        </>
    )
}










