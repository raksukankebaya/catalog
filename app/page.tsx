"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";

type Category = { id: string; name: string; description: string; imageUrl: string; active: boolean; sortOrder: number };
type Subcategory = { id: string; categoryId: string; name: string; active: boolean; sortOrder: number };
type Item = { id: string; categoryId: string; subcategoryId?: string; name: string; description: string; imageUrl: string; imageUrls?: string; type?: string; motif?: string; color?: string; size?: string; active: boolean; sortOrder: number };
type Slide = { id: string; title: string; subtitle: string; imageUrl: string; active: boolean; sortOrder: number };
type GalleryCategory = { id: string; name: string; description?: string; imageUrl: string; active: boolean; sortOrder: number };
type GalleryEntry = { id: string; galleryCategoryId: string; mediaType: "photo" | "video"; mediaUrl: string; thumbnailUrl?: string; title: string; location?: string; date?: string; active: boolean; sortOrder: number };
type Contact = Record<string, string>;
type Catalog = { categories: Category[]; subcategories: Subcategory[]; items: Item[]; carousel: Slide[]; galleryCategories: GalleryCategory[]; gallery: GalleryEntry[]; contact: Contact };
type AdminTab = "category" | "subcategory" | "item" | "carousel" | "galleryCategory" | "gallery" | "contact";

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
  galleryCategories: [
    { id: "nikahan", name: "Nikahan", description: "Momen sakral dalam balutan kebaya pilihan.", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=88", active: true, sortOrder: 1 },
    { id: "wisuda", name: "Wisuda", description: "Selebrasi pencapaian yang anggun dan berkesan.", imageUrl: "https://images.unsplash.com/photo-1606913079621-e64bd28682ba?auto=format&fit=crop&w=1400&q=88", active: true, sortOrder: 2 },
    { id: "tunangan", name: "Tunangan", description: "Pertemuan hangat menuju hari bahagia.", imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1400&q=88", active: true, sortOrder: 3 },
  ],
  gallery: [
    { id: "gallery-1", galleryCategoryId: "nikahan", mediaType: "photo", mediaUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=88", title: "Detail Kebaya Arunika", location: "Jakarta", date: "2026-07-20", active: true, sortOrder: 1 },
    { id: "gallery-2", galleryCategoryId: "tunangan", mediaType: "photo", mediaUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1400&q=88", title: "Sentuhan Bordir Larasati", location: "Bandung", date: "2026-07-18", active: true, sortOrder: 2 },
    { id: "gallery-3", galleryCategoryId: "wisuda", mediaType: "photo", mediaUrl: "https://images.unsplash.com/photo-1606913079621-e64bd28682ba?auto=format&fit=crop&w=1400&q=88", title: "Rona Tradisi Sekar", active: true, sortOrder: 3 },
  ],
  contact: { brand: "Raksukan Kebaya", tagline: "Elegansi yang tumbuh dari tradisi", description: "Koleksi kebaya pilihan dengan sentuhan feminin, bersih, dan elegan.", promiseEyebrow: "Setiap helai dipilih untuk merayakan", promiseTitle: "keanggunan yang terasa personal.", phone: "+62 812-3456-7890", whatsapp: "6281234567890", instagram: "raksukankabaya", email: "halo@raksukankabaya.com", address: "Indonesia" },
};

const sorted = <T extends { sortOrder: number }>(rows: T[]) => [...rows].sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));
const itemImages = (item: Item) => Array.from(new Set([item.imageUrl, ...(item.imageUrls || "").split(/[\n|]+/)].map((x) => x.trim()).filter(Boolean)));
const youtubeId = (url: string) => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/i)?.[1] || "";
const galleryThumb = (entry: GalleryEntry) => entry.thumbnailUrl || (youtubeId(entry.mediaUrl) ? `https://img.youtube.com/vi/${youtubeId(entry.mediaUrl)}/hqdefault.jpg` : entry.mediaUrl);
const socialUrl = (value: string | undefined, base: string) => !value ? "" : /^https?:\/\//i.test(value) ? value : `${base}${value.replace(/^@/, "")}`;
const noticeTone = (message: string) => /tersimpan|dihapus|siap digunakan/i.test(message) ? "success" : /gagal|salah|maksimal|wajib|belum diisi/i.test(message) ? "error" : "progress";

function StatusNotice({ message, floating = false }: { message: string; floating?: boolean }) {
  if (!message) return null;
  const tone = noticeTone(message);
  return <div className={`status-notice ${tone}${floating ? " floating" : ""}`} role="status"><span aria-hidden="true">{tone === "success" ? "✓" : tone === "error" ? "!" : ""}</span><p>{message}</p></div>;
}

export default function Home() {
  const [data, setData] = useState<Catalog>({ categories: [], subcategories: [], items: [], carousel: [], galleryCategories: [], gallery: [], contact: {} });
  const [slide, setSlide] = useState(0);
  const [category, setCategory] = useState<Category | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [detailImage, setDetailImage] = useState(0);
  const [categorySearch, setCategorySearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [galleryItem, setGalleryItem] = useState<GalleryEntry | null>(null);
  const [galleryCategoryId, setGalleryCategoryId] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryResultsRef = useRef<HTMLDivElement | null>(null);
  const galleryTouchStartX = useRef(0);
  const modalTouchStartX = useRef(0);
  const galleryMotionLock = useRef(false);
  const modalMotionLock = useRef(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminReady, setAdminReady] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>("category");
  const [editing, setEditing] = useState<Record<string, string | number | boolean>>({});
  const [notice, setNotice] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [galleryMotion, setGalleryMotion] = useState<"next" | "previous" | "">("");
  const [modalMotion, setModalMotion] = useState<"next" | "previous" | "">("");
  const [modalOutgoing, setModalOutgoing] = useState<GalleryEntry | null>(null);

  const refresh = async () => {
    if (!apiUrl || apiUrl.includes("PASTE_")) return;
    setIsCatalogLoading(true);
    try {
      const response = await fetch(`${apiUrl}?action=catalog&ts=${Date.now()}`);
      if (!response.ok) throw new Error("Server data tidak merespons.");
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || "Data katalog tidak dapat dibaca.");
      setData({ ...result.data, subcategories: result.data.subcategories || [], galleryCategories: result.data.galleryCategories || [], gallery: result.data.gallery || [] });
    } catch { /* Halaman tetap tampil tanpa memasukkan data contoh. */ }
    finally { setIsCatalogLoading(false); }
  };

  useEffect(() => {
    const configuredUrl = window.RAKSUKAN_CONFIG?.apiUrl?.trim() || "";
    if (!configuredUrl || configuredUrl.includes("PASTE_")) { setIsCatalogLoading(false); return; }
    setApiUrl(configuredUrl);
  }, []);
  useEffect(() => { if (apiUrl) refresh(); }, [apiUrl]);
  useEffect(() => {
    if (!isCatalogLoading) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isCatalogLoading]);
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
  useEffect(() => {
    if (!/tersimpan|dihapus|siap digunakan/i.test(notice)) return;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const activeSlides = useMemo(() => sorted(data.carousel.filter((x) => x.active)), [data.carousel]);
  const activeCategories = useMemo(() => sorted(data.categories.filter((x) => x.active)), [data.categories]);
  const activeSubcategories = useMemo(() => sorted(data.subcategories.filter((x) => x.active)), [data.subcategories]);
  const activeGalleryCategories = useMemo(() => sorted(data.galleryCategories.filter((x) => x.active)), [data.galleryCategories]);
  const activeGallery = useMemo(() => galleryCategoryId ? sorted(data.gallery.filter((x) => x.active && x.galleryCategoryId === galleryCategoryId)) : [], [data.gallery, galleryCategoryId]);
  useEffect(() => {
    if (!galleryItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGalleryItem(null);
      if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && activeGallery.length > 1) {
        setGalleryItem((current) => {
          if (!current) return null;
          const index = activeGallery.findIndex((entry) => entry.id === current.id);
          const direction = event.key === "ArrowRight" ? 1 : -1;
          return activeGallery[(index + direction + activeGallery.length) % activeGallery.length];
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [galleryItem, activeGallery]);
  useEffect(() => {
    if (!activeGallery.length) return;
    const indexes = [galleryIndex - 1, galleryIndex, galleryIndex + 1];
    indexes.forEach((index) => {
      const entry = activeGallery[(index + activeGallery.length) % activeGallery.length];
      if (entry?.mediaType === "photo") { const image = new Image(); image.src = entry.mediaUrl; }
    });
  }, [activeGallery, galleryIndex]);
  const searchText = (entry: Item) => {
    const cat = data.categories.find((x) => x.id === entry.categoryId)?.name || "";
    const sub = data.subcategories.find((x) => x.id === entry.subcategoryId)?.name || "";
    return [entry.id, entry.name, entry.description, cat, sub, entry.type, entry.motif, entry.color, entry.size].join(" ").toLowerCase();
  };
  const visibleItems = useMemo(() => category ? sorted(data.items.filter((x) => x.active && x.categoryId === category.id && searchText(x).includes(categorySearch.trim().toLowerCase()))) : [], [data, category, categorySearch]);
  const categorySubgroups = useMemo(() => category ? activeSubcategories.filter((sub) => sub.categoryId === category.id).map((sub) => ({ sub, items: visibleItems.filter((entry) => entry.subcategoryId === sub.id) })).filter((group) => group.items.length) : [], [category, activeSubcategories, visibleItems]);
  const searchResults = useMemo(() => showAllCollections && !searchQuery.trim() ? sorted(data.items.filter((x) => x.active)) : searchQuery.trim().length < 2 ? [] : sorted(data.items.filter((x) => x.active && searchText(x).includes(searchQuery.trim().toLowerCase()))), [data, searchQuery, showAllCollections]);
  const wishlistItems = useMemo(() => wishlist.map((id) => data.items.find((x) => x.id === id)).filter(Boolean) as Item[], [wishlist, data.items]);
  const currentSlide = activeSlides[slide % Math.max(activeSlides.length, 1)] || null;
  const currentGalleryEntry = activeGallery[galleryIndex % Math.max(activeGallery.length, 1)] || null;
  const previousGalleryEntry = activeGallery.length > 1 ? activeGallery[(galleryIndex - 1 + activeGallery.length) % activeGallery.length] : null;
  const nextGalleryEntry = activeGallery.length > 1 ? activeGallery[(galleryIndex + 1) % activeGallery.length] : null;
  const whatsapp = data.contact.whatsapp?.replace(/\D/g, "") || "";

  const selectGalleryCategory = (id: string) => {
    setGalleryCategoryId(id);
    setGalleryIndex(0);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => galleryResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
  };

  const moveGallery = (direction: number) => {
    if (activeGallery.length < 2 || galleryMotionLock.current) return;
    galleryMotionLock.current = true;
    setGalleryMotion(direction > 0 ? "next" : "previous");
    window.setTimeout(() => {
      setGalleryIndex((current) => (current + direction + activeGallery.length) % activeGallery.length);
      setGalleryMotion("");
      galleryMotionLock.current = false;
    }, 430);
  };
  const finishGallerySwipe = (endX: number) => {
    const distance = endX - galleryTouchStartX.current;
    if (Math.abs(distance) > 42) moveGallery(distance < 0 ? 1 : -1);
  };
  const moveGalleryModal = (direction: number) => {
    if (!galleryItem || activeGallery.length < 2 || modalMotionLock.current) return;
    modalMotionLock.current = true;
    const current = activeGallery.findIndex((entry) => entry.id === galleryItem.id);
    const target = activeGallery[(current + direction + activeGallery.length) % activeGallery.length];
    setModalOutgoing(galleryItem.mediaType === "photo" ? galleryItem : null);
    setModalMotion(direction > 0 ? "next" : "previous");
    setGalleryItem(target);
    window.setTimeout(() => {
      setModalOutgoing(null);
      setModalMotion("");
      modalMotionLock.current = false;
    }, 380);
  };
  const finishModalSwipe = (endX: number) => {
    const distance = endX - modalTouchStartX.current;
    if (Math.abs(distance) > 42) moveGalleryModal(distance < 0 ? 1 : -1);
  };

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
    event.preventDefault();
    if (adminTab === "carousel") {
      const title = String(editing.title || "");
      const subtitle = String(editing.subtitle || "");
      if (wordCount(title) > 4) { setNotice("Judul carousel maksimal 4 kata."); return; }
      if (wordCount(subtitle) > 9) { setNotice("Subjudul carousel maksimal 9 kata."); return; }
    }
    setNotice("Menyimpan perubahan…");
    try {
      const action = adminTab === "contact" ? "updateContact" : `upsert${adminTab[0].toUpperCase()}${adminTab.slice(1)}`;
      await callApi({ action, record: editing });
      setData((current) => {
        if (adminTab === "contact") return { ...current, contact: { ...current.contact, ...editing } as Contact };
        const record = { ...editing, active: editing.active !== false, sortOrder: Number(editing.sortOrder || 0) } as unknown as { id: string };
        const upsert = <T extends { id: string }>(rows: T[]) => rows.some((row) => row.id === record.id) ? rows.map((row) => row.id === record.id ? record as T : row) : [...rows, record as T];
        if (adminTab === "category") return { ...current, categories: upsert(current.categories) };
        if (adminTab === "subcategory") return { ...current, subcategories: upsert(current.subcategories) };
        if (adminTab === "item") return { ...current, items: upsert(current.items) };
        if (adminTab === "carousel") return { ...current, carousel: upsert(current.carousel) };
        if (adminTab === "galleryCategory") return { ...current, galleryCategories: upsert(current.galleryCategories) };
        return { ...current, gallery: upsert(current.gallery) };
      });
      setEditing({}); setNotice("Perubahan berhasil tersimpan.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Gagal menyimpan."); }
  };
  const remove = async () => {
    if (!editing.id || adminTab === "contact" || !confirm("Hapus data ini?")) return;
    setNotice("Menghapus…");
    try {
      const id = String(editing.id);
      await callApi({ action: `delete${adminTab[0].toUpperCase()}${adminTab.slice(1)}`, id });
      setData((current) => {
        if (adminTab === "category") return { ...current, categories: current.categories.filter((row) => row.id !== id), subcategories: current.subcategories.filter((row) => row.categoryId !== id), items: current.items.filter((row) => row.categoryId !== id) };
        if (adminTab === "subcategory") return { ...current, subcategories: current.subcategories.filter((row) => row.id !== id), items: current.items.map((row) => row.subcategoryId === id ? { ...row, subcategoryId: "" } : row) };
        if (adminTab === "item") return { ...current, items: current.items.filter((row) => row.id !== id) };
        if (adminTab === "carousel") return { ...current, carousel: current.carousel.filter((row) => row.id !== id) };
        if (adminTab === "galleryCategory") return { ...current, galleryCategories: current.galleryCategories.filter((row) => row.id !== id) };
        return { ...current, gallery: current.gallery.filter((row) => row.id !== id) };
      });
      setEditing({}); setNotice("Data berhasil dihapus.");
    }
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
    {isCatalogLoading && <div className="catalog-loading-overlay" role="status" aria-label="Memuat data katalog"><div className="catalog-loading-mark"><span aria-hidden="true" /><img src="logo.png" alt="" /></div></div>}
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Raksukan Kebaya - beranda"><img src="logo.png" alt="Logo Raksukan Kebaya" /><strong>Raksukan Kebaya</strong></a>
      <nav aria-label="Navigasi utama"><a href="#koleksi">Koleksi</a><a href="#galeri">Galeri</a><a href="#kontak">Kontak</a></nav>
      <div className="header-actions"><button onClick={() => { setShowAllCollections(false); setSearchOpen(true); }} aria-label="Cari katalog">⌕ <span>Cari</span></button><button onClick={() => setWishlistOpen(true)} aria-label={`My Wishlist, ${wishlist.length} item`}>♡ <span>My Wishlist</span>{wishlist.length > 0 && <b>{wishlist.length}</b>}</button></div>
    </header>

    {currentSlide ? <section className="hero" id="top" aria-roledescription="carousel"><img key={`backdrop-${currentSlide.id}`} src={currentSlide.imageUrl} alt="" className="hero-backdrop" aria-hidden="true" /><img key={currentSlide.id} src={currentSlide.imageUrl} alt="" className="hero-image" /><div className="hero-shade" /><div className="hero-content"><p className="eyebrow">Raksukan Kebaya</p><h1>{currentSlide.title}</h1><p>{currentSlide.subtitle}</p><a href="#koleksi" className="button light">Lihat koleksi <span>→</span></a></div>{activeSlides.length > 1 && <><button className="hero-arrow previous" onClick={() => setSlide((slide - 1 + activeSlides.length) % activeSlides.length)} aria-label="Gambar sebelumnya">‹</button><button className="hero-arrow next" onClick={() => setSlide((slide + 1) % activeSlides.length)} aria-label="Gambar berikutnya">›</button><div className="dots">{activeSlides.map((entry, index) => <button key={entry.id} className={index === slide ? "active" : ""} onClick={() => setSlide(index)} aria-label={`Tampilkan gambar ${index + 1}`} />)}</div></>}</section> : <section className="hero hero-brand" id="top"><div className="hero-shade" /><div className="hero-content"><p className="eyebrow">Raksukan Kebaya</p><h1>Keanggunan dalam setiap helai</h1><p>Kebaya pilihan untuk momen yang istimewa.</p><a href="#koleksi" className="button light">Lihat koleksi <span>→</span></a></div></section>}

    <section className="intro" id="koleksi"><p className="eyebrow">Koleksi pilihan</p><h2>Temukan kebaya untuk momenmu</h2><p>Pilih kategori untuk melihat detail setiap koleksi.</p></section>
    <section className="category-grid" aria-label="Kategori katalog">{activeCategories.map((entry) => <button className="category-card" key={entry.id} onClick={() => { setCategory(entry); setCategorySearch(""); setItem(null); }}><img src={entry.imageUrl} alt={entry.name} loading="lazy" /><span className="category-overlay"><small>Koleksi</small><strong>{entry.name}</strong><i>Jelajahi →</i></span></button>)}</section>
    <div className="all-collections"><button onClick={() => { setSearchQuery(""); setShowAllCollections(true); setSearchOpen(true); }}><span>Lihat semua koleksi</span><i>→</i></button></div>
    <section className="gallery-section" id="galeri">
      <div className="gallery-intro"><p className="eyebrow">Cerita dalam bingkai</p><h2>Galeri Raksukan</h2><p>Pilih suasana acara, lalu geser untuk menikmati setiap detail dan momen istimewa.</p></div>
      {activeGalleryCategories.length > 0 && <div className="gallery-category-grid" aria-label="Subkategori galeri">{activeGalleryCategories.map((entry) => <button key={entry.id} className={galleryCategoryId === entry.id ? "active" : ""} onClick={() => selectGalleryCategory(entry.id)}><img src={entry.imageUrl} alt={entry.name} loading="lazy" /><span><small>Galeri acara</small><strong>{entry.name}</strong>{entry.description && <i>{entry.description}</i>}<b>{galleryCategoryId === entry.id ? "Sedang ditampilkan" : "Buka galeri →"}</b></span></button>)}</div>}
      <div className={`gallery-results ${galleryCategoryId ? "visible" : ""}`} ref={galleryResultsRef}>
        {!galleryCategoryId ? <p className="gallery-prompt">Pilih salah satu subkategori di atas untuk membuka galerinya.</p> : currentGalleryEntry ? <div className="gallery-focus-wrap">
          <div className="gallery-focus-heading"><div><p className="eyebrow">{data.galleryCategories.find((entry) => entry.id === galleryCategoryId)?.name}</p><h3>{currentGalleryEntry.title}</h3></div><span>{String(galleryIndex + 1).padStart(2, "0")} / {String(activeGallery.length).padStart(2, "0")}</span></div>
          <div className={`gallery-focus-carousel ${galleryMotion ? `push-${galleryMotion}` : ""}`} onTouchStart={(event) => { galleryTouchStartX.current = event.touches[0].clientX; }} onTouchEnd={(event) => finishGallerySwipe(event.changedTouches[0].clientX)}>
            {previousGalleryEntry && <button key={`previous-${previousGalleryEntry.id}`} className="gallery-focus-card previous" onClick={() => moveGallery(-1)} aria-label="Foto sebelumnya"><img src={galleryThumb(previousGalleryEntry)} alt={previousGalleryEntry.title} /></button>}
            <button key={`current-${currentGalleryEntry.id}`} className="gallery-focus-card current" onClick={() => setGalleryItem(currentGalleryEntry)} aria-label={`Buka ${currentGalleryEntry.title}`}><img src={galleryThumb(currentGalleryEntry)} alt={currentGalleryEntry.title} />{currentGalleryEntry.mediaType === "video" && <span className="play-mark">▶</span>}<span className="gallery-focus-copy"><small>{currentGalleryEntry.mediaType === "video" ? "Video" : "Foto"}</small><strong>{currentGalleryEntry.title}</strong><i>Ketuk untuk melihat utuh</i></span></button>
            {nextGalleryEntry && <button key={`next-${nextGalleryEntry.id}`} className="gallery-focus-card next" onClick={() => moveGallery(1)} aria-label="Foto berikutnya"><img src={galleryThumb(nextGalleryEntry)} alt={nextGalleryEntry.title} /></button>}
            {activeGallery.length > 1 && <><button className="gallery-focus-arrow previous" onClick={() => moveGallery(-1)} aria-label="Geser ke foto sebelumnya">‹</button><button className="gallery-focus-arrow next" onClick={() => moveGallery(1)} aria-label="Geser ke foto berikutnya">›</button></>}
          </div>
          <p className="gallery-swipe-hint">Geser kanan atau kiri untuk melihat foto lainnya</p>
        </div> : <p className="gallery-empty">Belum ada media untuk subkategori ini.</p>}
      </div>
    </section>
    <section className="promise"><p>{data.contact.promiseEyebrow || "Setiap helai dipilih untuk merayakan"}</p><h2>{data.contact.promiseTitle || "keanggunan yang terasa personal."}</h2><span>✦</span></section>

    <footer id="kontak"><div className="footer-brand"><button className="footer-admin-trigger" onClick={() => setAdminOpen(true)} aria-label="Buka panel admin" title="Raksukan Kebaya"><img src="logo-footer-white.png" alt="Logo Raksukan Kebaya" /></button><div><h2>{data.contact.brand || "Raksukan Kebaya"}</h2><p>{data.contact.tagline}</p></div></div><div><h3>Hubungi kami</h3><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp · {data.contact.phone}</a><a href={`mailto:${data.contact.email}`}>{data.contact.email}</a><p>{data.contact.address}</p></div><div><h3>Media sosial</h3><div className="social-links">{data.contact.instagram && <a href={socialUrl(data.contact.instagram, "https://instagram.com/")} target="_blank" rel="noreferrer" aria-label={`Instagram ${data.contact.instagram}`}><img src="https://cdn.simpleicons.org/instagram/ffffff" alt="" /><span><strong>Instagram</strong><small>{data.contact.instagram}</small></span></a>}{data.contact.facebook && <a href={socialUrl(data.contact.facebook, "https://facebook.com/")} target="_blank" rel="noreferrer" aria-label={`Facebook ${data.contact.facebook}`}><img src="https://cdn.simpleicons.org/facebook/ffffff" alt="" /><span><strong>Facebook</strong><small>{data.contact.facebook}</small></span></a>}{data.contact.tiktok && <a href={socialUrl(data.contact.tiktok, "https://tiktok.com/@")} target="_blank" rel="noreferrer" aria-label={`TikTok ${data.contact.tiktok}`}><img src="https://cdn.simpleicons.org/tiktok/ffffff" alt="" /><span><strong>TikTok</strong><small>{data.contact.tiktok}</small></span></a>}</div><p>{data.contact.description}</p></div><small className="copyright">© {new Date().getFullYear()} Raksukan Kebaya. Seluruh hak dilindungi.</small></footer>
    {notice && !adminOpen && <StatusNotice message={notice} floating />}

    {category && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Koleksi ${category.name}`} onMouseDown={(e) => e.target === e.currentTarget && setCategory(null)}><section className="catalog-modal"><button className="close" onClick={() => setCategory(null)} aria-label="Tutup">×</button><div className="modal-heading"><button onClick={() => setCategory(null)}>← Semua kategori</button><div className="category-heading-row"><div><p className="eyebrow">{category.name}</p><h2>{category.description}</h2></div><label className="category-search"><span>⌕</span><input value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} placeholder="Cari dalam kategori…" aria-label="Cari dalam kategori" /></label></div></div>{categorySubgroups.length ? <div className="subcategory-sections">{categorySubgroups.map(({ sub, items }) => <section className="subcategory-section" key={sub.id}><div className="subcategory-title"><span>{String(sub.sortOrder).padStart(2, "0")}</span><h3>{sub.name}</h3><i>{items.length} koleksi</i></div><div className="item-grid">{items.map((entry) => <ItemCard key={entry.id} entry={entry} wished={wishlist.includes(entry.id)} openItem={openItem} toggleWishlist={toggleWishlist} />)}</div></section>)}</div> : <p className="empty">Tidak ada item yang cocok.</p>}</section></div>}

    {item && <ItemDetail item={item} category={data.categories.find((x) => x.id === item.categoryId)?.name} subcategory={data.subcategories.find((x) => x.id === item.subcategoryId)?.name} imageIndex={detailImage} setImageIndex={setDetailImage} wished={wishlist.includes(item.id)} toggleWishlist={toggleWishlist} whatsapp={whatsapp} close={() => setItem(null)} />}

    {searchOpen && <div className="modal-backdrop search-layer" role="dialog" aria-modal="true" aria-label="Pencarian katalog"><section className="search-modal"><button className="close" onClick={() => setSearchOpen(false)} aria-label="Tutup">×</button><p className="eyebrow">{showAllCollections ? "Seluruh katalog" : "Pencarian global"}</p><h2>{showAllCollections ? "Semua koleksi" : "Temukan koleksi Anda"}</h2><label className="global-search"><span>⌕</span><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Nama, tipe, motif, warna, size…" autoFocus /></label><div className="search-results">{!showAllCollections && searchQuery.trim().length < 2 ? <p>Ketik minimal 2 karakter untuk mencari seluruh katalog.</p> : searchResults.length ? searchResults.map((entry) => <button key={entry.id} onClick={() => openItem(entry)}><img src={entry.imageUrl} alt="" /><span><small>{data.categories.find((x) => x.id === entry.categoryId)?.name}</small><strong>{entry.name}</strong><i>{[entry.type, entry.motif, entry.color, entry.size].filter(Boolean).join(" · ")}</i></span></button>) : <p>Tidak ada koleksi yang cocok.</p>}</div></section></div>}

    {galleryItem && <div className="modal-backdrop gallery-layer" role="dialog" aria-modal="true" aria-label={galleryItem.title} onMouseDown={(e) => e.target === e.currentTarget && setGalleryItem(null)}><section className="gallery-modal" onTouchStart={(event) => { modalTouchStartX.current = event.touches[0].clientX; }} onTouchEnd={(event) => finishModalSwipe(event.changedTouches[0].clientX)}><button className="close" onClick={() => setGalleryItem(null)} aria-label="Tutup">×</button><div className={`gallery-media ${modalMotion ? `push-${modalMotion}` : ""}`}>{galleryItem.mediaType === "video" ? youtubeId(galleryItem.mediaUrl) ? <iframe src={`https://www.youtube.com/embed/${youtubeId(galleryItem.mediaUrl)}?autoplay=1`} title={galleryItem.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video src={galleryItem.mediaUrl} poster={galleryItem.thumbnailUrl} controls autoPlay /> : <>{modalOutgoing && <img className="gallery-modal-frame outgoing" src={modalOutgoing.mediaUrl} alt="" />}<img key={galleryItem.id} className={`gallery-modal-frame ${modalOutgoing ? "incoming" : ""}`} src={galleryItem.mediaUrl} alt={galleryItem.title} /></>}{activeGallery.length > 1 && <><button className="gallery-modal-arrow previous" onClick={() => moveGalleryModal(-1)} aria-label="Foto sebelumnya">‹</button><button className="gallery-modal-arrow next" onClick={() => moveGalleryModal(1)} aria-label="Foto berikutnya">›</button></>}</div><div className="gallery-copy"><p className="eyebrow">{galleryItem.mediaType === "video" ? "Video" : "Foto"}</p><h2>{galleryItem.title}</h2>{(galleryItem.location || galleryItem.date) && <p>{[galleryItem.location, galleryItem.date && new Date(`${galleryItem.date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })].filter(Boolean).join(" · ")}</p>}<small className="gallery-modal-hint">Geser untuk foto sebelumnya atau berikutnya</small></div></section></div>}

    {wishlistOpen && <div className="modal-backdrop wishlist-layer" role="dialog" aria-modal="true" aria-label="My Wishlist"><section className="wishlist-modal"><button className="close" onClick={() => setWishlistOpen(false)} aria-label="Tutup">×</button><h2>My Wishlist</h2>{wishlistItems.length ? <><div className="wishlist-list">{wishlistItems.map((entry) => <article key={entry.id}><button className="wishlist-open" onClick={() => { setWishlistOpen(false); openItem(entry); }}><img src={entry.imageUrl} alt={entry.name} /><span><strong>{entry.name}</strong><small>{entry.id}{entry.color ? ` · ${entry.color}` : ""}</small></span></button><button className="wishlist-remove" onClick={() => toggleWishlist(entry.id)} aria-label={`Hapus ${entry.name}`}>×</button></article>)}</div><a className="button brown send-wishlist" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(wishlistMessage)}`} target="_blank">Send My Wishlist via WhatsApp</a></> : <div className="empty-wishlist"><span>♡</span><p>Wishlist Anda masih kosong.</p><button onClick={() => setWishlistOpen(false)}>Lihat koleksi</button></div>}</section></div>}

    {adminOpen && <div className="modal-backdrop admin-layer" role="dialog" aria-modal="true" aria-label="Panel admin"><section className="admin-modal"><button className="close" onClick={() => { setAdminOpen(false); setNotice(""); }} aria-label="Tutup">×</button>{!adminReady ? <form className="login" onSubmit={loginAdmin}><img src="logo.png" alt="Logo Raksukan Kebaya" /><p className="eyebrow">Area pengelola</p><h2>Masuk ke panel admin</h2><p className="login-copy">Kelola koleksi, galeri, dan informasi website.</p><label><span>Password</span><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Masukkan password admin" autoFocus required /></label><button className="button brown" type="submit">Masuk</button><StatusNotice message={notice} /></form> : <AdminPanel data={data} tab={adminTab} setTab={(tab) => { setAdminTab(tab); setEditing(tab === "contact" ? data.contact : {}); }} editing={editing} setEditing={setEditing} openEdit={openEdit} save={save} remove={remove} uploadImage={uploadImage} uploadGalleryMedia={uploadGalleryMedia} notice={notice} />}</section></div>}
  </main>;
}

function ItemCard({ entry, wished, openItem, toggleWishlist }: { entry: Item; wished: boolean; openItem: (item: Item) => void; toggleWishlist: (id: string, event?: MouseEvent) => void }) {
  const cardSpecs = [["Size", entry.size], ["Motif", entry.motif], ["Warna", entry.color]].filter(([, value]) => Boolean(String(value || "").trim()));
  return <article className="item-card"><button className="item-open" onClick={() => openItem(entry)}><img src={entry.imageUrl} alt={entry.name} /><span className="item-card-copy">{entry.type && <small>{entry.type}</small>}<strong>{entry.name}</strong>{cardSpecs.length > 0 && <span className="item-card-specs">{cardSpecs.map(([label, value]) => <span className="item-card-spec" key={label}><b>{label}</b><em>{value}</em></span>)}</span>}</span></button><button className={`wish-button ${wished ? "active" : ""}`} onClick={(e) => toggleWishlist(entry.id, e)} aria-label={wished ? `Hapus ${entry.name} dari wishlist` : `Tambah ${entry.name} ke wishlist`}>{wished ? "♥" : "♡"}</button></article>;
}

function ItemDetail({ item, category, subcategory, imageIndex, setImageIndex, wished, toggleWishlist, whatsapp, close }: { item: Item; category?: string; subcategory?: string; imageIndex: number; setImageIndex: (n: number) => void; wished: boolean; toggleWishlist: (id: string, e?: MouseEvent) => void; whatsapp: string; close: () => void }) {
  const images = itemImages(item); const specs = [["Tipe", item.type], ["Motif", item.motif], ["Warna", item.color], ["Size", item.size]].filter(([, value]) => value);
  return <div className="modal-backdrop detail-layer" role="dialog" aria-modal="true" aria-label={item.name} onMouseDown={(e) => e.target === e.currentTarget && close()}><section className="detail-modal"><button className="close" onClick={close} aria-label="Tutup">×</button><div className="gallery"><img className="detail-main-image" src={images[imageIndex] || images[0]} alt={`${item.name}, gambar ${imageIndex + 1}`} />{images.length > 1 && <div className="thumbnails">{images.map((image, index) => <button key={image} className={index === imageIndex ? "active" : ""} onClick={() => setImageIndex(index)}><img src={image} alt={`Sudut ${index + 1}`} /></button>)}</div>}</div><div className="detail-copy"><p className="eyebrow">{[category, subcategory].filter(Boolean).join(" · ")}</p><h2>{item.name}</h2><p>{item.description}</p>{specs.length > 0 && <dl>{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}<div className="detail-actions"><button className={`button wishlist-action ${wished ? "active" : ""}`} onClick={(e) => toggleWishlist(item.id, e)}>{wished ? "♥ Tersimpan" : "♡ Add To Wishlist"}</button>{whatsapp && <a className="button brown" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Halo, saya tertarik dengan ${item.name} (${item.id}).`)}`} target="_blank">Tanya via WhatsApp</a>}</div></div></section></div>;
}

function AdminPanel({ data, tab, setTab, editing, setEditing, openEdit, save, remove, uploadImage, uploadGalleryMedia, notice }: { data: Catalog; tab: AdminTab; setTab: (t: AdminTab) => void; editing: Record<string, string | number | boolean>; setEditing: React.Dispatch<React.SetStateAction<Record<string, string | number | boolean>>>; openEdit: (t: AdminTab, r: Record<string, unknown>) => void; save: (e: FormEvent) => void; remove: () => void; uploadImage: (f?: File, field?: string, append?: boolean) => void; uploadGalleryMedia: (f?: File) => void; notice: string }) {
  const rows = tab === "category" ? data.categories : tab === "subcategory" ? data.subcategories : tab === "item" ? data.items : tab === "carousel" ? data.carousel : tab === "galleryCategory" ? data.galleryCategories : tab === "gallery" ? data.gallery : [];
  const update = (key: string, value: string | number | boolean) => setEditing((old) => ({ ...old, [key]: value }));
  const tabs: { key: AdminTab; label: string }[] = [{ key: "category", label: "Kategori" }, { key: "subcategory", label: "Subkategori" }, { key: "item", label: "Item" }, { key: "carousel", label: "Carousel" }, { key: "galleryCategory", label: "Kategori Galeri" }, { key: "gallery", label: "Media Galeri" }, { key: "contact", label: "Kontak" }];
  return <div className="admin-shell"><div className="admin-top"><p className="eyebrow">Raksukan Kebaya</p><h2>Panel Admin</h2><nav>{tabs.map(({ key, label }) => <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}</button>)}</nav></div><div className={`admin-body ${tab === "contact" ? "contact-mode" : ""}`}>{tab !== "contact" && <aside><button className="new-record" onClick={() => setEditing({ active: true, sortOrder: rows.length + 1, ...(tab === "gallery" ? { mediaType: "photo" } : {}) })}>＋ Tambah baru</button>{tab === "subcategory" ? data.categories.map((parent) => { const children = sorted(data.subcategories.filter((sub) => sub.categoryId === parent.id)); return children.length ? <div className="admin-subcategory-group" key={parent.id}><h4>{parent.name}</h4>{children.map((row) => <button key={row.id} className={editing.id === row.id ? "selected" : ""} onClick={() => openEdit(tab, row)}><strong>{row.name}</strong><small>{row.id}</small></button>)}</div> : null; }) : rows.map((row) => <button key={row.id} className={editing.id === row.id ? "selected" : ""} onClick={() => openEdit(tab, row)}><strong>{"name" in row ? row.name : row.title}</strong><small>{row.id}</small></button>)}</aside>}<form className="editor" onSubmit={save}><h3>{tab === "contact" ? "Informasi website & kontak" : editing.id ? "Ubah data" : "Tambah data"}</h3>
    {tab === "category" && <><Field label="ID unik" value={editing.id} onChange={(v) => update("id", v)} required /><Field label="Nama kategori" value={editing.name} onChange={(v) => update("name", v)} required /><Area label="Deskripsi" value={editing.description} onChange={(v) => update("description", v)} /><ImageFields editing={editing} update={update} uploadImage={uploadImage} /></>}
    {tab === "subcategory" && <><Field label="ID unik" value={editing.id} onChange={(v) => update("id", v)} required /><label>Kategori utama<select value={String(editing.categoryId || "")} onChange={(e) => update("categoryId", e.target.value)} required><option value="">Pilih kategori</option>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><Field label="Nama subkategori" value={editing.name} onChange={(v) => update("name", v)} required /></>}
    {tab === "item" && <><Field label="ID / kode item" value={editing.id} onChange={(v) => update("id", v)} required /><label>Kategori<select value={String(editing.categoryId || "")} onChange={(e) => { update("categoryId", e.target.value); update("subcategoryId", ""); }} required><option value="">Pilih kategori</option>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Subkategori<select value={String(editing.subcategoryId || "")} onChange={(e) => update("subcategoryId", e.target.value)} required><option value="">Pilih subkategori</option>{data.subcategories.filter((s) => s.categoryId === editing.categoryId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><Field label="Nama item" value={editing.name} onChange={(v) => update("name", v)} required /><Area label="Deskripsi" value={editing.description} onChange={(v) => update("description", v)} /><div className="four-fields"><Field label="Tipe (opsional)" value={editing.type} onChange={(v) => update("type", v)} /><Field label="Motif (opsional)" value={editing.motif} onChange={(v) => update("motif", v)} /><Field label="Warna (opsional)" value={editing.color} onChange={(v) => update("color", v)} /><Field label="Size (opsional)" value={editing.size} onChange={(v) => update("size", v)} /></div><ImageFields editing={editing} update={update} uploadImage={uploadImage} multiple /></>}
    {tab === "carousel" && <><Field label="ID unik" value={editing.id} onChange={(v) => update("id", v)} required /><Field label="Judul" value={editing.title} onChange={(v) => update("title", v)} required maxWords={4} /><Area label="Subjudul" value={editing.subtitle} onChange={(v) => update("subtitle", v)} maxWords={9} /><ImageFields editing={editing} update={update} uploadImage={uploadImage} /></>}
    {tab === "galleryCategory" && <><Field label="ID subkategori" value={editing.id} onChange={(v) => update("id", v)} required /><Field label="Nama subkategori Galeri" value={editing.name} onChange={(v) => update("name", v)} required /><Area label="Deskripsi singkat" value={editing.description} onChange={(v) => update("description", v)} /><Field label="URL foto sampul di awal Galeri" value={editing.imageUrl} onChange={(v) => update("imageUrl", v)} required /><label className="upload">Atau unggah foto sampul<input type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])} /></label>{editing.imageUrl && <img className="gallery-cover-preview" src={String(editing.imageUrl)} alt="Pratinjau foto sampul" />}</>}
    {tab === "gallery" && <><Field label="ID unik" value={editing.id} onChange={(v) => update("id", v)} required /><label>Subkategori Galeri<select value={String(editing.galleryCategoryId || "")} onChange={(e) => update("galleryCategoryId", e.target.value)} required><option value="">Pilih subkategori</option>{data.galleryCategories.filter((x) => x.active).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label><label>Jenis media<select value={String(editing.mediaType || "photo")} onChange={(e) => update("mediaType", e.target.value)} required><option value="photo">Foto</option><option value="video">Video</option></select></label><Field label="Judul" value={editing.title} onChange={(v) => update("title", v)} required /><Field label="URL foto / video" value={editing.mediaUrl} onChange={(v) => update("mediaUrl", v)} required /><Field label="URL thumbnail (opsional untuk foto/YouTube)" value={editing.thumbnailUrl} onChange={(v) => update("thumbnailUrl", v)} /><label className="upload">Atau unggah foto / video<input type="file" accept="image/*,video/*" onChange={(e) => uploadGalleryMedia(e.target.files?.[0])} /></label>{(editing.thumbnailUrl || editing.mediaUrl) && <img className="gallery-admin-preview" src={editing.thumbnailUrl ? String(editing.thumbnailUrl) : String(editing.mediaUrl)} alt="Pratinjau thumbnail" />}<div className="row-fields"><Field label="Lokasi (opsional)" value={editing.location} onChange={(v) => update("location", v)} /><Field label="Tanggal (opsional)" type="date" value={editing.date} onChange={(v) => update("date", v)} /></div></>}
    {tab === "contact" && <div className="contact-form-grid"><Field label="Nama brand" value={editing.brand ?? data.contact.brand} onChange={(v) => update("brand", v)} /><Field label="Tagline" value={editing.tagline ?? data.contact.tagline} onChange={(v) => update("tagline", v)} /><Field label="Telepon" value={editing.phone ?? data.contact.phone} onChange={(v) => update("phone", v)} /><Field label="WhatsApp admin" value={editing.whatsapp ?? data.contact.whatsapp} onChange={(v) => update("whatsapp", v)} /><Field label="Instagram (username atau link)" value={editing.instagram ?? data.contact.instagram} onChange={(v) => update("instagram", v)} /><Field label="Facebook (username atau link)" value={editing.facebook ?? data.contact.facebook} onChange={(v) => update("facebook", v)} /><Field label="TikTok (username atau link)" value={editing.tiktok ?? data.contact.tiktok} onChange={(v) => update("tiktok", v)} /><Field label="Email" value={editing.email ?? data.contact.email} onChange={(v) => update("email", v)} /><div className="contact-field-wide"><Area label="Deskripsi footer" value={editing.description ?? data.contact.description} onChange={(v) => update("description", v)} rows={3} /></div><div className="contact-field-wide"><Field label="Teks kecil sebelum kalimat utama" value={editing.promiseEyebrow ?? data.contact.promiseEyebrow} onChange={(v) => update("promiseEyebrow", v)} /></div><div className="contact-field-wide"><Field label="Kalimat keanggunan" value={editing.promiseTitle ?? data.contact.promiseTitle} onChange={(v) => update("promiseTitle", v)} /></div><div className="contact-field-wide"><Area label="Alamat lengkap" value={editing.address ?? data.contact.address} onChange={(v) => update("address", v)} rows={5} /></div></div>}
    {tab !== "contact" && <div className="row-fields"><Field label="Urutan" type="number" value={editing.sortOrder} onChange={(v) => update("sortOrder", Number(v))} /><label className="check"><input type="checkbox" checked={editing.active !== false} onChange={(e) => update("active", e.target.checked)} /> Tampilkan</label></div>}<div className="editor-actions"><button className="button brown" type="submit">Simpan</button>{editing.id && tab !== "contact" && <button className="delete-button" type="button" onClick={remove}>Hapus</button>}</div><StatusNotice message={notice} /></form></div></div>;
}

function wordCount(value: string) { const text = value.trim(); return text ? text.split(/\s+/).length : 0; }
function Field({ label, value, onChange, required, type = "text", maxWords }: { label: string; value: unknown; onChange: (v: string) => void; required?: boolean; type?: string; maxWords?: number }) { const text = String(value ?? ""); const updateValue = (next: string) => { if (!maxWords || wordCount(next) <= maxWords) onChange(next); }; return <label>{label}<input type={type} value={text} onChange={(e) => updateValue(e.target.value)} required={required} />{maxWords && <small className="field-limit">{wordCount(text)}/{maxWords} kata</small>}</label>; }
function Area({ label, value, onChange, rows = 4, maxWords }: { label: string; value: unknown; onChange: (v: string) => void; rows?: number; maxWords?: number }) { const text = String(value ?? ""); const updateValue = (next: string) => { if (!maxWords || wordCount(next) <= maxWords) onChange(next); }; return <label>{label}<textarea value={text} onChange={(e) => updateValue(e.target.value)} rows={rows} />{maxWords && <small className="field-limit">{wordCount(text)}/{maxWords} kata</small>}</label>; }
function ImageFields({ editing, update, uploadImage, multiple = false }: { editing: Record<string, string | number | boolean>; update: (k: string, v: string) => void; uploadImage: (f?: File, field?: string, append?: boolean) => void; multiple?: boolean }) { return <><Field label="URL gambar utama" value={editing.imageUrl} onChange={(v) => update("imageUrl", v)} required /><label className="upload">Atau unggah gambar utama<input type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])} /></label>{multiple && <><Area label="Galeri tambahan (satu URL per baris)" value={editing.imageUrls} onChange={(v) => update("imageUrls", v)} /><label className="upload">Tambah gambar galeri<input type="file" accept="image/*" multiple onChange={(e) => Array.from(e.target.files || []).forEach((file) => uploadImage(file, "imageUrls", true))} /></label></>}{editing.imageUrl && <img className="image-preview" src={String(editing.imageUrl)} alt="Pratinjau" />}</>; }
