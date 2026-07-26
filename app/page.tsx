"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";

type Category = { id: string; name: string; description: string; imageUrl: string; active: boolean; sortOrder: number };
type Subcategory = { id: string; categoryId: string; name: string; active: boolean; sortOrder: number };
type Item = { id: string; categoryId: string; subcategoryId?: string; name: string; description: string; imageUrl: string; imageUrls?: string; type?: string; motif?: string; color?: string; size?: string; active: boolean; sortOrder: number };
type Slide = { id: string; title: string; subtitle: string; imageUrl: string; active: boolean; sortOrder: number };
type GalleryEntry = { id: string; mediaType: "photo" | "video"; mediaUrl: string; thumbnailUrl?: string; title: string; location?: string; date?: string; active: boolean; sortOrder: number };
type Contact = Record<string, string>;
type Catalog = { categories: Category[]; subcategories: Subcategory[]; items: Item[]; carousel: Slide[]; gallery: GalleryEntry[]; contact: Contact };
type AdminTab = "category" | "subcategory" | "item" | "carousel" | "gallery" | "contact";

declare global { interface Window { RAKSUKAN_CONFIG?: { apiUrl?: string } } }

const WISHLIST_KEY = "raksukan-kebaya-wishlist";
const WISHLIST_TTL = 3 * 60 * 60 * 1000;
const fallback: Catalog = {
  categories: [
    { id: "kebaya-modern", name: "Kebaya Modern", description: "Siluet kontemporer dengan sentuhan kebaya yang anggun.", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85", active: true, sortOrder: 1 },
    { id: "kebaya-klasik", name: "Kebaya Klasik", description: "Kebaya bernuansa tradisi untuk momen istimewa.", imageUrl: "https://images.unsplash.com/photo-1606913079621-e64bd28682ba?auto=format&fit=crop&w=1200&q=85", active: true, sortOrder: 2 },
    { id: "set-keluarga", name: "Set Keluarga", description: "Pilihan busana serasi untuk perayaan bersama keluarga.", imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85", active: true, sortOrder: 3 },
  ],
  subcategories: [
    { id: "akad", categoryId: "kebaya-modern", name: "Akad & Lamaran", active: true, sortOrder: 1 },
    { id: "pesta", categoryId: "kebaya-modern", name: "Pesta", active: true, sortOrder: 2 },
    { id: "tradisional", categoryId: "kebaya-klasik", name: "Tradisional", active: true, sortOrder: 1 },
    { id: "keluarga", categoryId: "set-keluarga", name: "Keluarga", active: true, sortOrder: 1 },
  ],
  items: [
    { id: "KBM-001", categoryId: "kebaya-modern", subcategoryId: "akad", name: "Kebaya Arunika", description: "Kebaya bernuansa champagne dengan detail bordir lembut. Cocok untuk lamaran, akad, dan acara keluarga.", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85", imageUrls: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85", type: "Kebaya Modern", motif: "Bordir floral", color: "Champagne", size: "S, M, L", active: true, sortOrder: 1 },
    { id: "KBM-002", categoryId: "kebaya-modern", subcategoryId: "pesta", name: "Kebaya Larasati", description: "Potongan modern yang ringan dengan permainan tekstur feminin dan elegan.", imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85", type: "Kebaya Modern", color: "Dusty rose", active: true, sortOrder: 2 },
    { id: "KBK-001", categoryId: "kebaya-klasik", subcategoryId: "tradisional", name: "Kebaya Sekar", description: "Kebaya klasik berpalet cokelat hangat dengan detail motif tradisional.", imageUrl: "https://images.unsplash.com/photo-1606913079621-e64bd28682ba?auto=format&fit=crop&w=1200&q=85", motif: "Tradisional", color: "Cokelat", active: true, sortOrder: 1 },
    { id: "SKF-001", categoryId: "set-keluarga", subcategoryId: "keluarga", name: "Set Harmoni", description: "Busana keluarga serasi dengan palet netral yang lembut untuk hari bahagia.", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85", type: "Set Keluarga", active: true, sortOrder: 1 },
  ],
  carousel: [
    { id: "slide-1", title: "Kebaya yang bercerita", subtitle: "Temukan sentuhan anggun untuk setiap momen istimewa.", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=88", active: true, sortOrder: 1 },
    { id: "slide-2", title: "Rona klasik, pesona masa kini", subtitle: "Koleksi pilihan dengan detail yang lembut dan berkelas.", imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1800&q=88", active: true, sortOrder: 2 },
    { id: "slide-3", title: "Dirancang untuk dikenang", subtitle: "Busana istimewa untuk hari yang tak terlupakan.", imageUrl: "https://images.unsplash.com/photo-1606913079621-e64bd28682ba?auto=format&fit=crop&w=1800&q=88", active: true, sortOrder: 3 },
  ],
  gallery: [
    { id: "gallery-1", mediaType: "photo", mediaUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=88", title: "Detail Kebaya Arunika", location: "Jakarta", date: "2026-07-20", active: true, sortOrder: 1 },
    { id: "gallery-2", mediaType: "photo", mediaUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1400&q=88", title: "Sentuhan Bordir Larasati", location: "Bandung", date: "2026-07-18", active: true, sortOrder: 2 },
    { id: "gallery-3", mediaType: "photo", mediaUrl: "https://images.unsplash.com/photo-1606913079621-e64bd28682ba?auto=format&fit=crop&w=1400&q=88", title: "Rona Tradisi Sekar", active: true, sortOrder: 3 },
  ],
  contact: { brand: "Raksukan Kebaya", tagline: "Elegansi yang tumbuh dari tradisi", description: "Koleksi kebaya pilihan dengan sentuhan feminin, bersih, dan elegan.", promiseEyebrow: "Setiap helai dipilih untuk merayakan", promiseTitle: "keanggunan yang terasa personal.", phone: "+62 812-3456-7890", whatsapp: "6281234567890", instagram: "raksukankabaya", email: "halo@raksukankabaya.com", address: "Indonesia" },
};

const sorted = <T extends { sortOrder: number }>(rows: T[]) => [...rows].sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));
const itemImages = (item: Item) => Array.from(new Set([item.imageUrl, ...(item.imageUrls || "").split(/[\n|]+/)].map((x) => x.trim()).filter(Boolean)));
const youtubeId = (url: string) => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/i)?.[1] || "";
const galleryThumb = (entry: GalleryEntry) => entry.thumbnailUrl || (youtubeId(entry.mediaUrl) ? `https://img.youtube.com/vi/${youtubeId(entry.mediaUrl)}/hqdefault.jpg` : entry.mediaUrl);

export default function Home() {
  const [data, setData] = useState<Catalog>(fallback);
  const [slide, setSlide] = useState(0);
  const [category, setCategory] = useState<Category | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [detailImage, setDetailImage] = useState(0);
  const [categorySearch, setCategorySearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [galleryItem, setGalleryItem] = useState<GalleryEntry | null>(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminReady, setAdminReady] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>("category");
  const [editing, setEditing] = useState<Record<string, string | number | boolean>>({});
  const [notice, setNotice] = useState("");
  const apiUrl = typeof window !== "undefined" ? window.RAKSUKAN_CONFIG?.apiUrl?.trim() : "";

  const refresh = async () => {
    if (!apiUrl || apiUrl.includes("PASTE_")) return;
    try {
      const response = await fetch(`${apiUrl}?action=catalog&ts=${Date.now()}`);
      const result = await response.json();
      if (result.ok) setData({ ...result.data, subcategories: result.data.subcategories || [], gallery: result.data.gallery || [] });
    } catch { setNotice("Data spreadsheet belum dapat dimuat. Menampilkan katalog contoh."); }
  };

  useEffect(() => { refresh(); }, [apiUrl]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "null");
      if (stored?.expiresAt > Date.now() && Array.isArray(stored.ids)) setWishlist(stored.ids);
      else localStorage.removeItem(WISHLIST_KEY);
    } catch { localStorage.removeItem(WISHLIST_KEY); }
  }, []);
  useEffect(() => {
    if (data.carousel.length < 2) return;
    const timer = setInterval(() => setSlide((current) => (current + 1) % data.carousel.length), 5500);
    return () => clearInterval(timer);
  }, [data.carousel.length]);

  const activeSlides = useMemo(() => sorted(data.carousel.filter((x) => x.active)), [data.carousel]);
  const activeCategories = useMemo(() => sorted(data.categories.filter((x) => x.active)), [data.categories]);
  const activeSubcategories = useMemo(() => sorted(data.subcategories.filter((x) => x.active)), [data.subcategories]);
  const activeGallery = useMemo(() => sorted(data.gallery.filter((x) => x.active)), [data.gallery]);
  const searchText = (entry: Item) => {
    const cat = data.categories.find((x) => x.id === entry.categoryId)?.name || "";
    const sub = data.subcategories.find((x) => x.id === entry.subcategoryId)?.name || "";
    return [entry.id, entry.name, entry.description, cat, sub, entry.type, entry.motif, entry.color, entry.size].join(" ").toLowerCase();
  };
  const visibleItems = useMemo(() => category ? sorted(data.items.filter((x) => x.active && x.categoryId === category.id && searchText(x).includes(categorySearch.trim().toLowerCase()))) : [], [data, category, categorySearch]);
  const categorySubgroups = useMemo(() => category ? activeSubcategories.filter((sub) => sub.categoryId === category.id).map((sub) => ({ sub, items: visibleItems.filter((entry) => entry.subcategoryId === sub.id) })).filter((group) => group.items.length) : [], [category, activeSubcategories, visibleItems]);
  const searchResults = useMemo(() => showAllCollections && !searchQuery.trim() ? sorted(data.items.filter((x) => x.active)) : searchQuery.trim().length < 2 ? [] : sorted(data.items.filter((x) => x.active && searchText(x).includes(searchQuery.trim().toLowerCase()))), [data, searchQuery, showAllCollections]);
  const wishlistItems = useMemo(() => wishlist.map((id) => data.items.find((x) => x.id === id)).filter(Boolean) as Item[], [wishlist, data.items]);
  const currentSlide = activeSlides[slide % Math.max(activeSlides.length, 1)] || fallback.carousel[0];
  const whatsapp = data.contact.whatsapp?.replace(/\D/g, "") || "";

  const persistWishlist = (ids: string[]) => {
    setWishlist(ids);
    if (ids.length) localStorage.setItem(WISHLIST_KEY, JSON.stringify({ ids, expiresAt: Date.now() + WISHLIST_TTL }));
    else localStorage.removeItem(WISHLIST_KEY);
  };
  const toggleWishlist = (id: string, event?: MouseEvent) => {
    event?.stopPropagation();
    persistWishlist(wishlist.includes(id) ? wishlist.filter((x) => x !== id) : [...wishlist, id]);
  };
  const openItem = (entry: Item) => { setItem(entry); setDetailImage(0); setSearchOpen(false); };
  const wishlistMessage = ["Halo Raksukan Kebaya, saya tertarik dengan wishlist berikut:", "", ...wishlistItems.map((entry, index) => `${index + 1}. ${entry.name} (${entry.id})${entry.color ? ` – Warna: ${entry.color}` : ""}${entry.size ? ` – Size: ${entry.size}` : ""}`), "", "Mohon informasi lebih lanjut. Terima kasih."].join("\n");

  const callApi = async (payload: Record<string, unknown>) => {
    if (!apiUrl || apiUrl.includes("PASTE_")) throw new Error("Endpoint Google Apps Script belum diisi di config.js.");
    const response = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ ...payload, password: adminPassword }) });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Permintaan gagal.");
    return result;
  };
  const loginAdmin = async (event: FormEvent) => {
    event.preventDefault(); setNotice("Memeriksa akses…");
    try { await callApi({ action: "adminCheck" }); setAdminReady(true); setNotice(""); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Password salah."); }
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setNotice("Menyimpan perubahan…");
    try {
      const action = adminTab === "contact" ? "updateContact" : `upsert${adminTab[0].toUpperCase()}${adminTab.slice(1)}`;
      await callApi({ action, record: editing }); await refresh(); setEditing({}); setNotice("Perubahan tersimpan.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Gagal menyimpan."); }
  };
  const remove = async () => {
    if (!editing.id || adminTab === "contact" || !confirm("Hapus data ini?")) return;
    setNotice("Menghapus…");
    try { await callApi({ action: `delete${adminTab[0].toUpperCase()}${adminTab.slice(1)}`, id: editing.id }); await refresh(); setEditing({}); setNotice("Data dihapus."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Gagal menghapus."); }
  };
  const uploadImage = async (file?: File, field = "imageUrl", append = false) => {
    if (!file) return;
    if (file.size > 4_000_000) { setNotice("Ukuran gambar maksimal 4 MB."); return; }
    setNotice("Mengunggah gambar…");
    const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    try {
      const result = await callApi({ action: "uploadImage", fileName: file.name, mimeType: file.type, data: dataUrl.split(",")[1] });
      setEditing((old) => ({ ...old, [field]: append && old[field] ? `${old[field]}\n${result.url}` : result.url })); setNotice("Gambar siap digunakan.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Gagal mengunggah gambar."); }
  };
  const uploadGalleryMedia = async (file?: File) => {
    if (!file) return;
    const maxSize = file.type.startsWith("video/") ? 20_000_000 : 4_000_000;
    if (file.size > maxSize) { setNotice(file.type.startsWith("video/") ? "Ukuran video maksimal 20 MB." : "Ukuran foto maksimal 4 MB."); return; }
    setNotice("Mengunggah media…");
    const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    try {
      const result = await callApi({ action: "uploadMedia", fileName: file.name, mimeType: file.type, data: dataUrl.split(",")[1] });
      setEditing((old) => ({ ...old, mediaType: result.mediaType, mediaUrl: result.url, thumbnailUrl: result.thumbnailUrl }));
      setNotice("Media siap digunakan.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Gagal mengunggah media."); }
  };
  const openEdit = (tab: AdminTab, record: Record<string, unknown>) => { setAdminTab(tab); setEditing(record as Record<string, string | number | boolean>); };

  return <main>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Raksukan Kebaya - beranda"><img src="logo.png" alt="Logo Raksukan Kebaya" /><strong>Raksukan Kebaya</strong></a>
      <nav aria-label="Navigasi utama"><a href="#koleksi">Koleksi</a><a href="#galeri">Galeri</a><a href="#kontak">Kontak</a></nav>
      <div className="header-actions"><button onClick={() => { setShowAllCollections(false); setSearchOpen(true); }} aria-label="Cari katalog">⌕ <span>Cari</span></button><button onClick={() => setWishlistOpen(true)} aria-label={`My Wishlist, ${wishlist.length} item`}>♡ <span>My Wishlist</span>{wishlist.length > 0 && <b>{wishlist.length}</b>}</button></div>
    </header>

    <section className="hero" id="top" aria-roledescription="carousel"><img key={currentSlide.id} src={currentSlide.imageUrl} alt="" className="hero-image" /><div className="hero-shade" /><div className="hero-content"><p className="eyebrow">Raksukan Kebaya</p><h1>{currentSlide.title}</h1><p>{currentSlide.subtitle}</p><a href="#koleksi" className="button light">Lihat koleksi <span>→</span></a></div><button className="hero-arrow previous" onClick={() => setSlide((slide - 1 + activeSlides.length) % activeSlides.length)} aria-label="Gambar sebelumnya">‹</button><button className="hero-arrow next" onClick={() => setSlide((slide + 1) % activeSlides.length)} aria-label="Gambar berikutnya">›</button><div className="dots">{activeSlides.map((entry, index) => <button key={entry.id} className={index === slide ? "active" : ""} onClick={() => setSlide(index)} aria-label={`Tampilkan gambar ${index + 1}`} />)}</div></section>

    <section className="intro" id="koleksi"><p className="eyebrow">Koleksi pilihan</p><h2>Temukan kebaya untuk momenmu</h2><p>Pilih kategori untuk melihat detail setiap koleksi.</p></section>
    <section className="category-grid" aria-label="Kategori katalog">{activeCategories.map((entry) => <button className="category-card" key={entry.id} onClick={() => { setCategory(entry); setCategorySearch(""); setItem(null); }}><img src={entry.imageUrl} alt={entry.name} loading="lazy" /><span className="category-overlay"><small>Koleksi</small><strong>{entry.name}</strong><i>Jelajahi →</i></span></button>)}</section>
    <div className="all-collections"><button onClick={() => { setSearchQuery(""); setShowAllCollections(true); setSearchOpen(true); }}><span>Lihat semua koleksi</span><i>→</i></button></div>
    <section className="gallery-section" id="galeri"><div className="gallery-intro"><p className="eyebrow">Cerita dalam bingkai</p><h2>Galeri Raksukan</h2><p>Detail, suasana, dan momen istimewa dari setiap karya.</p></div>{activeGallery.length ? <div className="gallery-showcase">{activeGallery.map((entry) => <button className="gallery-card" key={entry.id} onClick={() => setGalleryItem(entry)}><img src={galleryThumb(entry)} alt={entry.title} loading="lazy" />{entry.mediaType === "video" && <span className="play-mark">▶</span>}<span className="gallery-overlay"><small>{entry.mediaType === "video" ? "Video" : "Foto"}</small><strong>{entry.title}</strong>{(entry.location || entry.date) && <i>{[entry.location, entry.date && new Date(`${entry.date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })].filter(Boolean).join(" · ")}</i>}</span></button>)}</div> : <p className="gallery-empty">Galeri akan segera hadir.</p>}</section>
    <section className="promise"><p>{data.contact.promiseEyebrow || "Setiap helai dipilih untuk merayakan"}</p><h2>{data.contact.promiseTitle || "keanggunan yang terasa personal."}</h2><span>✦</span></section>

    <footer id="kontak"><div className="footer-brand"><img src="logo-footer-white.png" alt="Logo Raksukan Kebaya" /><div><h2>{data.contact.brand || "Raksukan Kebaya"}</h2><p>{data.contact.tagline}</p></div></div><div><h3>Hubungi kami</h3><a href={`https://wa.me/${whatsapp}`} target="_blank">WhatsApp · {data.contact.phone}</a><a href={`mailto:${data.contact.email}`}>{data.contact.email}</a><p>{data.contact.address}</p></div><div><h3>Media sosial</h3><a href={`https://instagram.com/${data.contact.instagram?.replace(/^@/, "")}`} target="_blank">Instagram · @{data.contact.instagram?.replace(/^@/, "")}</a><p>{data.contact.description}</p></div><small className="copyright">© {new Date().getFullYear()} Raksukan Kebaya. Seluruh hak dilindungi.</small></footer>
    <button className="admin-button" onClick={() => setAdminOpen(true)} aria-label="Buka panel admin" title="Admin">⚙</button>{notice && !adminOpen && <div className="toast">{notice}</div>}

    {category && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Koleksi ${category.name}`} onMouseDown={(e) => e.target === e.currentTarget && setCategory(null)}><section className="catalog-modal"><button className="close" onClick={() => setCategory(null)} aria-label="Tutup">×</button><div className="modal-heading"><button onClick={() => setCategory(null)}>← Semua kategori</button><div className="category-heading-row"><div><p className="eyebrow">{category.name}</p><h2>{category.description}</h2></div><label className="category-search"><span>⌕</span><input value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} placeholder="Cari dalam kategori…" aria-label="Cari dalam kategori" /></label></div></div>{categorySubgroups.length ? <div className="subcategory-sections">{categorySubgroups.map(({ sub, items }) => <section className="subcategory-section" key={sub.id}><div className="subcategory-title"><span>{String(sub.sortOrder).padStart(2, "0")}</span><h3>{sub.name}</h3><i>{items.length} koleksi</i></div><div className="item-grid">{items.map((entry) => <ItemCard key={entry.id} entry={entry} wished={wishlist.includes(entry.id)} openItem={openItem} toggleWishlist={toggleWishlist} />)}</div></section>)}</div> : <p className="empty">Tidak ada item yang cocok.</p>}</section></div>}

    {item && <ItemDetail item={item} category={data.categories.find((x) => x.id === item.categoryId)?.name} subcategory={data.subcategories.find((x) => x.id === item.subcategoryId)?.name} imageIndex={detailImage} setImageIndex={setDetailImage} wished={wishlist.includes(item.id)} toggleWishlist={toggleWishlist} whatsapp={whatsapp} close={() => setItem(null)} />}

    {searchOpen && <div className="modal-backdrop search-layer" role="dialog" aria-modal="true" aria-label="Pencarian katalog"><section className="search-modal"><button className="close" onClick={() => setSearchOpen(false)} aria-label="Tutup">×</button><p className="eyebrow">{showAllCollections ? "Seluruh katalog" : "Pencarian global"}</p><h2>{showAllCollections ? "Semua koleksi" : "Temukan koleksi Anda"}</h2><label className="global-search"><span>⌕</span><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Nama, tipe, motif, warna, size…" autoFocus /></label><div className="search-results">{!showAllCollections && searchQuery.trim().length < 2 ? <p>Ketik minimal 2 karakter untuk mencari seluruh katalog.</p> : searchResults.length ? searchResults.map((entry) => <button key={entry.id} onClick={() => openItem(entry)}><img src={entry.imageUrl} alt="" /><span><small>{data.categories.find((x) => x.id === entry.categoryId)?.name}</small><strong>{entry.name}</strong><i>{[entry.type, entry.motif, entry.color, entry.size].filter(Boolean).join(" · ")}</i></span></button>) : <p>Tidak ada koleksi yang cocok.</p>}</div></section></div>}

    {galleryItem && <div className="modal-backdrop gallery-layer" role="dialog" aria-modal="true" aria-label={galleryItem.title} onMouseDown={(e) => e.target === e.currentTarget && setGalleryItem(null)}><section className="gallery-modal"><button className="close" onClick={() => setGalleryItem(null)} aria-label="Tutup">×</button><div className="gallery-media">{galleryItem.mediaType === "video" ? youtubeId(galleryItem.mediaUrl) ? <iframe src={`https://www.youtube.com/embed/${youtubeId(galleryItem.mediaUrl)}?autoplay=1`} title={galleryItem.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video src={galleryItem.mediaUrl} poster={galleryItem.thumbnailUrl} controls autoPlay /> : <img src={galleryItem.mediaUrl} alt={galleryItem.title} />}</div><div className="gallery-copy"><p className="eyebrow">{galleryItem.mediaType === "video" ? "Video" : "Foto"}</p><h2>{galleryItem.title}</h2>{(galleryItem.location || galleryItem.date) && <p>{[galleryItem.location, galleryItem.date && new Date(`${galleryItem.date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })].filter(Boolean).join(" · ")}</p>}</div></section></div>}

    {wishlistOpen && <div className="modal-backdrop wishlist-layer" role="dialog" aria-modal="true" aria-label="My Wishlist"><section className="wishlist-modal"><button className="close" onClick={() => setWishlistOpen(false)} aria-label="Tutup">×</button><h2>My Wishlist</h2>{wishlistItems.length ? <><div className="wishlist-list">{wishlistItems.map((entry) => <article key={entry.id}><button className="wishlist-open" onClick={() => { setWishlistOpen(false); openItem(entry); }}><img src={entry.imageUrl} alt={entry.name} /><span><strong>{entry.name}</strong><small>{entry.id}{entry.color ? ` · ${entry.color}` : ""}</small></span></button><button className="wishlist-remove" onClick={() => toggleWishlist(entry.id)} aria-label={`Hapus ${entry.name}`}>×</button></article>)}</div><a className="button brown send-wishlist" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(wishlistMessage)}`} target="_blank">Send My Wishlist via WhatsApp</a></> : <div className="empty-wishlist"><span>♡</span><p>Wishlist Anda masih kosong.</p><button onClick={() => setWishlistOpen(false)}>Lihat koleksi</button></div>}</section></div>}

    {adminOpen && <div className="modal-backdrop admin-layer" role="dialog" aria-modal="true" aria-label="Panel admin"><section className="admin-modal"><button className="close" onClick={() => { setAdminOpen(false); setNotice(""); }} aria-label="Tutup">×</button>{!adminReady ? <form className="login" onSubmit={loginAdmin}><img src="logo.png" alt="" /><p className="eyebrow">Area pengelola</p><h2>Masuk ke panel admin</h2><label>Password<input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} autoFocus required /></label><button className="button brown" type="submit">Masuk</button>{notice && <p className="form-notice">{notice}</p>}</form> : <AdminPanel data={data} tab={adminTab} setTab={(tab) => { setAdminTab(tab); setEditing(tab === "contact" ? data.contact : {}); }} editing={editing} setEditing={setEditing} openEdit={openEdit} save={save} remove={remove} uploadImage={uploadImage} uploadGalleryMedia={uploadGalleryMedia} notice={notice} />}</section></div>}
  </main>;
}

function ItemCard({ entry, wished, openItem, toggleWishlist }: { entry: Item; wished: boolean; openItem: (item: Item) => void; toggleWishlist: (id: string, event?: MouseEvent) => void }) {
  return <article className="item-card"><button className="item-open" onClick={() => openItem(entry)}><img src={entry.imageUrl} alt={entry.name} /><span>{entry.type && <small>{entry.type}</small>}<strong>{entry.name}</strong><i>{[entry.motif, entry.color].filter(Boolean).join(" · ") || "Lihat detail →"}</i></span></button><button className={`wish-button ${wished ? "active" : ""}`} onClick={(e) => toggleWishlist(entry.id, e)} aria-label={wished ? `Hapus ${entry.name} dari wishlist` : `Tambah ${entry.name} ke wishlist`}>{wished ? "♥" : "♡"}</button></article>;
}

function ItemDetail({ item, category, subcategory, imageIndex, setImageIndex, wished, toggleWishlist, whatsapp, close }: { item: Item; category?: string; subcategory?: string; imageIndex: number; setImageIndex: (n: number) => void; wished: boolean; toggleWishlist: (id: string, e?: MouseEvent) => void; whatsapp: string; close: () => void }) {
  const images = itemImages(item); const specs = [["Tipe", item.type], ["Motif", item.motif], ["Warna", item.color], ["Size", item.size]].filter(([, value]) => value);
  return <div className="modal-backdrop detail-layer" role="dialog" aria-modal="true" aria-label={item.name} onMouseDown={(e) => e.target === e.currentTarget && close()}><section className="detail-modal"><button className="close" onClick={close} aria-label="Tutup">×</button><div className="gallery"><img className="detail-main-image" src={images[imageIndex] || images[0]} alt={`${item.name}, gambar ${imageIndex + 1}`} />{images.length > 1 && <div className="thumbnails">{images.map((image, index) => <button key={image} className={index === imageIndex ? "active" : ""} onClick={() => setImageIndex(index)}><img src={image} alt={`Sudut ${index + 1}`} /></button>)}</div>}</div><div className="detail-copy"><p className="eyebrow">{[category, subcategory].filter(Boolean).join(" · ")}</p><h2>{item.name}</h2><p>{item.description}</p>{specs.length > 0 && <dl>{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}<div className="detail-actions"><button className={`button wishlist-action ${wished ? "active" : ""}`} onClick={(e) => toggleWishlist(item.id, e)}>{wished ? "♥ Tersimpan" : "♡ Add To Wishlist"}</button>{whatsapp && <a className="button brown" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Halo, saya tertarik dengan ${item.name} (${item.id}).`)}`} target="_blank">Tanya via WhatsApp</a>}</div></div></section></div>;
}

function AdminPanel({ data, tab, setTab, editing, setEditing, openEdit, save, remove, uploadImage, uploadGalleryMedia, notice }: { data: Catalog; tab: AdminTab; setTab: (t: AdminTab) => void; editing: Record<string, string | number | boolean>; setEditing: React.Dispatch<React.SetStateAction<Record<string, string | number | boolean>>>; openEdit: (t: AdminTab, r: Record<string, unknown>) => void; save: (e: FormEvent) => void; remove: () => void; uploadImage: (f?: File, field?: string, append?: boolean) => void; uploadGalleryMedia: (f?: File) => void; notice: string }) {
  const rows = tab === "category" ? data.categories : tab === "subcategory" ? data.subcategories : tab === "item" ? data.items : tab === "carousel" ? data.carousel : tab === "gallery" ? data.gallery : [];
  const update = (key: string, value: string | number | boolean) => setEditing((old) => ({ ...old, [key]: value }));
  const tabs: { key: AdminTab; label: string }[] = [{ key: "category", label: "Kategori" }, { key: "subcategory", label: "Subkategori" }, { key: "item", label: "Item" }, { key: "carousel", label: "Carousel" }, { key: "gallery", label: "Galeri" }, { key: "contact", label: "Kontak" }];
  return <div className="admin-shell"><div className="admin-top"><p className="eyebrow">Raksukan Kebaya</p><h2>Panel Admin</h2><nav>{tabs.map(({ key, label }) => <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}</button>)}</nav></div><div className="admin-body">{tab !== "contact" && <aside><button className="new-record" onClick={() => setEditing({ active: true, sortOrder: rows.length + 1, ...(tab === "gallery" ? { mediaType: "photo" } : {}) })}>＋ Tambah baru</button>{tab === "subcategory" ? data.categories.map((parent) => { const children = sorted(data.subcategories.filter((sub) => sub.categoryId === parent.id)); return children.length ? <div className="admin-subcategory-group" key={parent.id}><h4>{parent.name}</h4>{children.map((row) => <button key={row.id} className={editing.id === row.id ? "selected" : ""} onClick={() => openEdit(tab, row)}><strong>{row.name}</strong><small>{row.id}</small></button>)}</div> : null; }) : rows.map((row) => <button key={row.id} className={editing.id === row.id ? "selected" : ""} onClick={() => openEdit(tab, row)}><strong>{"name" in row ? row.name : row.title}</strong><small>{row.id}</small></button>)}</aside>}<form className="editor" onSubmit={save}><h3>{tab === "contact" ? "Informasi website & kontak" : editing.id ? "Ubah data" : "Tambah data"}</h3>
    {tab === "category" && <><Field label="ID unik" value={editing.id} onChange={(v) => update("id", v)} required /><Field label="Nama kategori" value={editing.name} onChange={(v) => update("name", v)} required /><Area label="Deskripsi" value={editing.description} onChange={(v) => update("description", v)} /><ImageFields editing={editing} update={update} uploadImage={uploadImage} /></>}
    {tab === "subcategory" && <><Field label="ID unik" value={editing.id} onChange={(v) => update("id", v)} required /><label>Kategori utama<select value={String(editing.categoryId || "")} onChange={(e) => update("categoryId", e.target.value)} required><option value="">Pilih kategori</option>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><Field label="Nama subkategori" value={editing.name} onChange={(v) => update("name", v)} required /></>}
    {tab === "item" && <><Field label="ID / kode item" value={editing.id} onChange={(v) => update("id", v)} required /><label>Kategori<select value={String(editing.categoryId || "")} onChange={(e) => { update("categoryId", e.target.value); update("subcategoryId", ""); }} required><option value="">Pilih kategori</option>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Subkategori<select value={String(editing.subcategoryId || "")} onChange={(e) => update("subcategoryId", e.target.value)} required><option value="">Pilih subkategori</option>{data.subcategories.filter((s) => s.categoryId === editing.categoryId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><Field label="Nama item" value={editing.name} onChange={(v) => update("name", v)} required /><Area label="Deskripsi" value={editing.description} onChange={(v) => update("description", v)} /><div className="four-fields"><Field label="Tipe (opsional)" value={editing.type} onChange={(v) => update("type", v)} /><Field label="Motif (opsional)" value={editing.motif} onChange={(v) => update("motif", v)} /><Field label="Warna (opsional)" value={editing.color} onChange={(v) => update("color", v)} /><Field label="Size (opsional)" value={editing.size} onChange={(v) => update("size", v)} /></div><ImageFields editing={editing} update={update} uploadImage={uploadImage} multiple /></>}
    {tab === "carousel" && <><Field label="ID unik" value={editing.id} onChange={(v) => update("id", v)} required /><Field label="Judul" value={editing.title} onChange={(v) => update("title", v)} required /><Area label="Subjudul" value={editing.subtitle} onChange={(v) => update("subtitle", v)} /><ImageFields editing={editing} update={update} uploadImage={uploadImage} /></>}
    {tab === "gallery" && <><Field label="ID unik" value={editing.id} onChange={(v) => update("id", v)} required /><label>Jenis media<select value={String(editing.mediaType || "photo")} onChange={(e) => update("mediaType", e.target.value)} required><option value="photo">Foto</option><option value="video">Video</option></select></label><Field label="Judul" value={editing.title} onChange={(v) => update("title", v)} required /><Field label="URL foto / video" value={editing.mediaUrl} onChange={(v) => update("mediaUrl", v)} required /><Field label="URL thumbnail (opsional untuk foto/YouTube)" value={editing.thumbnailUrl} onChange={(v) => update("thumbnailUrl", v)} /><label className="upload">Atau unggah foto / video<input type="file" accept="image/*,video/*" onChange={(e) => uploadGalleryMedia(e.target.files?.[0])} /></label>{(editing.thumbnailUrl || editing.mediaUrl) && <img className="gallery-admin-preview" src={editing.thumbnailUrl ? String(editing.thumbnailUrl) : String(editing.mediaUrl)} alt="Pratinjau thumbnail" />}<div className="row-fields"><Field label="Lokasi (opsional)" value={editing.location} onChange={(v) => update("location", v)} /><Field label="Tanggal (opsional)" type="date" value={editing.date} onChange={(v) => update("date", v)} /></div></>}
    {tab === "contact" && <>{[["brand","Nama brand"],["tagline","Tagline"],["description","Deskripsi footer"],["promiseEyebrow","Teks kecil sebelum kalimat utama"],["promiseTitle","Kalimat keanggunan"],["phone","Telepon"],["whatsapp","WhatsApp admin"],["instagram","Instagram"],["email","Email"],["address","Alamat"]].map(([key,label]) => <Field key={key} label={label} value={editing[key] ?? data.contact[key]} onChange={(v) => update(key, v)} />)}</>}
    {tab !== "contact" && <div className="row-fields"><Field label="Urutan" type="number" value={editing.sortOrder} onChange={(v) => update("sortOrder", Number(v))} /><label className="check"><input type="checkbox" checked={editing.active !== false} onChange={(e) => update("active", e.target.checked)} /> Tampilkan</label></div>}<div className="editor-actions"><button className="button brown" type="submit">Simpan</button>{editing.id && tab !== "contact" && <button className="delete-button" type="button" onClick={remove}>Hapus</button>}</div>{notice && <p className="form-notice">{notice}</p>}</form></div></div>;
}

function Field({ label, value, onChange, required, type = "text" }: { label: string; value: unknown; onChange: (v: string) => void; required?: boolean; type?: string }) { return <label>{label}<input type={type} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} required={required} /></label>; }
function Area({ label, value, onChange }: { label: string; value: unknown; onChange: (v: string) => void }) { return <label>{label}<textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} rows={4} /></label>; }
function ImageFields({ editing, update, uploadImage, multiple = false }: { editing: Record<string, string | number | boolean>; update: (k: string, v: string) => void; uploadImage: (f?: File, field?: string, append?: boolean) => void; multiple?: boolean }) { return <><Field label="URL gambar utama" value={editing.imageUrl} onChange={(v) => update("imageUrl", v)} required /><label className="upload">Atau unggah gambar utama<input type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])} /></label>{multiple && <><Area label="Galeri tambahan (satu URL per baris)" value={editing.imageUrls} onChange={(v) => update("imageUrls", v)} /><label className="upload">Tambah gambar galeri<input type="file" accept="image/*" multiple onChange={(e) => Array.from(e.target.files || []).forEach((file) => uploadImage(file, "imageUrls", true))} /></label></>}{editing.imageUrl && <img className="image-preview" src={String(editing.imageUrl)} alt="Pratinjau" />}</>; }
