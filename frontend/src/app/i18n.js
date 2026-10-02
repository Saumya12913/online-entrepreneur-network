// ---------------------------------------------------------------------------
// Complete multi-lingual UI layer.
//
// The portal used to translate only a small set of hand-picked labels. This
// module translates the *rendered interface* instead: every text node and every
// placeholder/title the app paints is matched against the phrase catalogue
// below and replaced, so choosing a language converts the whole UI. Content the
// catalogue doesn't know (a founder's bio, a project name, an email address)
// is left exactly as the user wrote it, and numbers are preserved by the
// "#"-template matching.
// ---------------------------------------------------------------------------

import { buildIndex, startUiTranslator } from "./i18n-runtime.js";
import CATALOG_PROFILE from "./i18n-catalog-2.js";
import CATALOG_PROJECTS from "./i18n-catalog-3.js";
import CATALOG_OFFERS from "./i18n-catalog-4.js";

export const UI_LANGS = [{
  code: "en",
  label: "English"
}, {
  code: "ta",
  label: "தமிழ்"
}, {
  code: "hi",
  label: "हिन्दी"
}, {
  code: "bn",
  label: "বাংলা"
}, {
  code: "pa",
  label: "ਪੰਜਾਬੀ"
}, {
  code: "es",
  label: "Español"
}, {
  code: "fr",
  label: "Français"
}, {
  code: "de",
  label: "Deutsch"
}, {
  code: "pt",
  label: "Português"
}, {
  code: "it",
  label: "Italiano"
}, {
  code: "ru",
  label: "Русский"
}, {
  code: "zh",
  label: "中文"
}, {
  code: "ja",
  label: "日本語"
}];

const COLS = UI_LANGS.map(l => l.code); // en, ta, hi, bn, pa, es, fr, de, pt, it, ru, zh, ja

// Catalogue rows: [English, தமிழ், हिन्दी, বাংলা, ਪੰਜਾਬੀ, Español, Français, Deutsch,
// Português, Italiano, Русский, 中文, 日本語]. "#" stands for any number.
const ROWS = [];

function row(...cells) {
  ROWS.push(cells);
}

// Topic catalogues (projects, profile, offers, agreements, meetings, webinars…).
ROWS.push(...CATALOG_PROJECTS, ...CATALOG_PROFILE, ...CATALOG_OFFERS);

/**
 * Translate the rendered UI under `root` into `lang` and keep it translated.
 * Returns a stop function, so this is safe to call from a React effect.
 */
export function enableUiLanguage(root, lang) {
  buildIndex(ROWS, COLS);
  return startUiTranslator(root, lang);
}

// --- Navigation, sections and view titles ----------------------------------
row("Dashboard", "முகப்பு", "डैशबोर्ड", "ড্যাশবোর্ড", "ਡੈਸ਼ਬੋਰਡ", "Panel", "Tableau de bord", "Übersicht", "Painel", "Dashboard", "Панель", "仪表板", "ダッシュボード");
row("Discover", "கண்டுபிடி", "खोजें", "আবিষ্কার করুন", "ਖੋਜੋ", "Descubrir", "Découvrir", "Entdecken", "Descobrir", "Scopri", "Открытия", "发现", "発見");
row("Browse Projects", "திட்டங்கள்", "परियोजनाएँ", "প্রকল্প ব্রাউজ করুন", "ਪ੍ਰਾਜੈਕਟ ਵੇਖੋ", "Explorar proyectos", "Parcourir les projets", "Projekte durchsuchen", "Explorar projetos", "Sfoglia i progetti", "Проекты", "浏览项目", "プロジェクト");
row("Connections", "இணைப்புகள்", "संपर्क", "সংযোগ", "ਸੰਪਰਕ", "Contactos", "Relations", "Kontakte", "Contatos", "Contatti", "Контакты", "人脉", "コネクション");
row("Messages", "செய்திகள்", "संदेश", "বার্তা", "ਸੁਨੇਹੇ", "Mensajes", "Messages", "Nachrichten", "Mensagens", "Messaggi", "Сообщения", "消息", "メッセージ");
row("Portfolio", "சொத்துப் பட்டியல்", "पोर्टफोलियो", "পোর্টফোলিও", "ਪੋਰਟਫੋਲੀਓ", "Cartera", "Portefeuille", "Portfolio", "Portfólio", "Portafoglio", "Портфель", "投资组合", "ポートフォリオ");
row("Requirements", "தேவைகள்", "आवश्यकताएँ", "প্রয়োজনীয়তা", "ਲੋੜਾਂ", "Requisitos", "Exigences", "Anforderungen", "Requisitos", "Requisiti", "Требования", "融资需求", "募集要件");
row("Investments", "முதலீடுகள்", "निवेश", "বিনিয়োগ", "ਨਿਵੇਗ", "Inversiones", "Investissements", "Investitionen", "Investimentos", "Investimenti", "Инвестиции", "投资", "投資");
row("Offers", "வாய்புகள்", "प्रस्ताव", "অফার", "ਪੇਸ਼ਕਸ਼", "Ofertas", "Offres", "Angebote", "Ofertas", "Offerte", "Предложения", "录用通知", "オファー");
row("Get Help", "உதவி பெறு", "सहायता लें", "সাহায্য নিন", "ਮਦਦ ਲਵੋ", "Pedir ayuda", "Demander de l'aide", "Hilfe erhalten", "Pedir ajuda", "Chiedi aiuto", "Нужна помощь", "寻求帮助", "助けを求める");
row("Help Founders", "நிறுவனர்களுக்கு உதவு", "संस्थापकों की मदद", "প্রতিষ্ঠাতাদের সাহায্য", "ਸੰਸਥਾਪਕਾਂ ਦੀ ਮਦਦ", "Ayudar a fundadores", "Aider les fondateurs", "Gründern helfen", "Ajudar fundadores", "Aiuta i fondatori", "Помочь основателям", "帮助创业者", "創業者を支援");
row("Agreements", "ஒப்பந்தங்கள்", "अनुबंध", "চুক্তি", "ਸਮਝੌਤੇ", "Acuerdos", "Accords", "Vereinbarungen", "Acordos", "Accordi", "Соглашения", "协议", "契約");
row("My Meetings", "என் சந்திப்புகள்", "मेरी बैठकें", "আমার বৈঠক", "ਮੇਰੀ ਮੀਟਿੰਗਾਂ", "Mis reuniones", "Mes rendez-vous", "Meine Termine", "Minhas reuniões", "I miei incontri", "Мои встречи", "我的会议", "マイミーティング");
row("Webinars", "வெபினார்கள்", "वेबिनार", "ওয়েবিনার", "ਵੈਬਨਾਰ", "Seminarios web", "Webinaires", "Webinare", "Webinars", "Webinar", "Вебинары", "网络研讨会", "ウェビナー");
row("My Profile", "என் சுயவிவரம்", "मेरी प्रोफ़ाइल", "আমার প্রোফাইল", "ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ", "Mi perfil", "Mon profil", "Mein Profil", "Meu perfil", "Il mio profilo", "Мой профиль", "我的资料", "マイプロフィール");
row("Network", "வலையமைப்பு", "नेटवर्क", "নেটওয়ার্ক", "ਨੈੱਟਵਰਕ", "Red", "Réseau", "Netzwerk", "Rede", "Rete", "Сеть", "人脉网络", "ネットワーク");
row("Admin Dashboard", "நிர்வாக முகப்பு", "एडमिन डैशबोर्ड", "অ্যাডমিন ড্যাশবোর্ড", "ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ", "Panel de administración", "Tableau d'administration", "Admin-Übersicht", "Painel administrativo", "Dashboard amministrativo", "Панель администратора", "管理后台", "管理者ダッシュボード");
row("User Management", "பயனர் நிர்வாகம்", "उपयोगकर्ता प्रबंधन", "ব্যবহারকারী ব্যবস্থাপনা", "ਯੂਜ਼ਰ ਪ੍ਰਬੰਧਨ", "Gestión de usuarios", "Gestion des utilisateurs", "Benutzerverwaltung", "Gestão de usuários", "Gestione utenti", "Управление пользователями", "用户管理", "ユーザー管理");
row("Platform Administration", "தள நிர்வாகம்", "प्लेटफ़ॉर्म प्रशासन", "প্ল্যাটফর্ম প্রশাসন", "ਪਲਾਟਫ਼ਾਰਮ ਪ੍ਰਸ਼ਾਸਨ", "Administración de la plataforma", "Administration de la plateforme", "Plattformverwaltung", "Administração da plataforma", "Amministrazione della piattaforma", "Администрирование платформы", "平台管理", "プラットフォーム管理");
row("Ratings & Reviews", "மதிப்பீடுகள் & விமர்சனங்கள்", "रेटिंग और समीक्षाएँ", "রেটিং ও পর্যালোচনা", "ਰੇਟਿੰਗ ਤੇ ਸਮੀਖਿਆਵਾਂ", "Valoraciones y reseñas", "Notes et avis", "Bewertungen", "Avaliações e análises", "Valutazioni e recensioni", "Оценки и отзывы", "评分与评价", "評価とレビュー");
row("Verification & Trust", "சரிபார்ப்பு & நம்பகத்தன்மை", "सत्यापन और विश्वसनीयता", "যাচাই ও বিশ্বাসযোগ্যতা", "ਤਸਦੀਕ ਅਤੇ ਭਰੋਸਾ", "Verificación y confianza", "Vérification et confiance", "Verifizierung und Vertrauen", "Verificação e confiança", "Verifica e fiducia", "Верификация и доверие", "认证与信任", "認証と信頼");
row("Bonds", "பந்தங்கள்", "बॉन्ड", "বন্ড", "ਬੌਂਡ", "Vínculos", "Engagements", "Bindungen", "Vínculos", "Vincoli", "Обязательства", "聘用契约", "ボンド");
row("Offers Sent", "அனுப்பிய வாய்புகள்", "भेजे गए प्रस्ताव", "পাঠানো অফার", "ਭੇਜੇ ਪੇਸ਼ਕਸ਼", "Ofertas enviadas", "Offres envoyées", "Gesendete Angebote", "Ofertas enviadas", "Offerte inviate", "Отправленные предложения", "已发送的录用", "送信済みオファー");
row("Offers Received", "பெற்ற வாய்புகள்", "प्राप्त प्रस्ताव", "প্রাপ্ত অফার", "ਪ੍ਰਾਪਤ ਪੇਸ਼ਕਸ਼", "Ofertas recibidas", "Offres reçues", "Erhaltene Angebote", "Ofertas recebidas", "Offerte ricevute", "Полученные предложения", "收到的录用", "受領したオファー");
row("Recently accessed", "சமீபத்தில் பார்த்தவை", "हाल में देखे गए", "সম্প্রতি দেখা", "ਸਮੀਪ ਵਿੱਚ ਦੇਖਿਆ", "Accedidos recientemente", "Consultés récemment", "Zuletzt aufgerufen", "Acessados recentemente", "Accessati di recente", "Недавние просмотренные", "最近访问", "最近閲覧");
row("Notifications", "அறிவிப்புகள்", "सूचनाएँ", "বিজ্ঞপ্তি", "ਸੂਚਨਾਵਾਂ", "Notificaciones", "Notifications", "Benachrichtigungen", "Notificações", "Notifiche", "Уведомления", "通知", "通知");
row("Language", "மொழி", "भाषा", "ভাষা", "ਭਾਸ਼ਾ", "Idioma", "Langue", "Sprache", "Idioma", "Lingua", "Язык", "语言", "言語");
row("Search", "தேடு", "खोजें", "খুঁজুন", "ਖੋਜੋ", "Buscar", "Rechercher", "Suchen", "Buscar", "Cerca", "Поиск", "搜索", "検索");
row("See all", "அனைத்தும்", "सभी देखें", "সব দেখুন", "ਸਾਰੇ ਵੇਖੋ", "Ver todo", "Tout voir", "Alle anzeigen", "Ver tudo", "Vedi tutti", "Показать все", "查看全部", "すべて表示");

// --- Common buttons and short labels ---------------------------------------
row("Save", "சேமி", "सहेजें", "সংরক্ষণ", "ਸੰਭਾਲੋ", "Guardar", "Enregistrer", "Speichern", "Salvar", "Salva", "Сохранить", "保存", "保存");
row("Save Changes", "மாற்றங்களை சேமி", "परिवर्तन सहेजें", "পরিবর্তন সংরক্ষণ", "ਬਦਲਾਅ ਸੰਭਾਲੋ", "Guardar cambios", "Enregistrer les modifications", "Änderungen speichern", "Salvar alterações", "Salva modifiche", "Сохранить изменения", "保存更改", "変更を保存");
row("Cancel", "ரத்து", "रद्द करें", "বাতিল", "ਰੱਦ ਕਰੋ", "Cancelar", "Annuler", "Abbrechen", "Cancelar", "Annulla", "Отмена", "取消", "キャンセル");
row("Close", "மூடு", "बंद करें", "বন্ধ করুন", "ਬੰਦ ਕਰੋ", "Cerrar", "Fermer", "Schließen", "Fechar", "Chiudi", "Закрыть", "关闭", "閉じる");
row("Submit", "சமர்ப்பி", "जमा करें", "জমা দিন", "ਜਮ੍ਹਾਂ ਕਰੋ", "Enviar", "Soumettre", "Einreichen", "Enviar", "Invia", "Отправить", "提交", "送信");
row("Send", "அனுப்பு", "भेजें", "পাঠান", "ਭੇਜੋ", "Enviar", "Envoyer", "Senden", "Enviar", "Invia", "Отправить", "发送", "送信");
row("Edit", "திருத்து", "संपादित करें", "সম্পাদনা", "ਸੋਧੋ", "Editar", "Modifier", "Bearbeiten", "Editar", "Modifica", "Редактировать", "编辑", "編集");
row("Remove", "நீக்கு", "हटाएँ", "সরান", "ਹਟਾਓ", "Quitar", "Supprimer", "Entfernen", "Remover", "Rimuovi", "Удалить", "移除", "削除");
row("Confirm remove", "நீக்க உறுதிப்படுத்து", "हटाने की पुष्टि करें", "সরানো নিশ্চিত করুন", "ਹਟਾਉਣ ਦੀ ਪੁਸ਼ਟੀ", "Confirmar eliminación", "Confirmer la suppression", "Entfernen bestätigen", "Confirmar remoção", "Conferma rimozione", "Подтвердить удаление", "确认移除", "削除を確認");
row("View", "காண்க", "देखें", "দেখুন", "ਵੇਖੋ", "Ver", "Voir", "Ansehen", "Ver", "Vedi", "Просмотр", "查看", "表示");
row("View Profile", "சுயவிவரத்தை காண்க", "प्रोफ़ाइल देखें", "প্রোফাইল দেখুন", "ਪ੍ਰੋਫਾਈਲ ਵੇਖੋ", "Ver perfil", "Voir le profil", "Profil ansehen", "Ver perfil", "Vedi profilo", "Смотреть профиль", "查看资料", "プロフィールを見る");
row("Connect", "இணை", "जुड़ें", "সংযুক্ত", "ਜੁੜੋ", "Conectar", "Se connecter", "Verbinden", "Conectar", "Connetti", "Подключиться", "建立联系", "つながる");
row("Clear", "அழி", "साफ़ करें", "মুছুন", "ਮਿਟਾਓ", "Limpiar", "Effacer", "Leeren", "Limpar", "Pulisci", "Очистить", "清除", "クリア");
row("Clear all", "அனைத்தையும் அழி", "सभी साफ़ करें", "সব মুছুন", "ਸਾਰੇ ਮਿਟਾਓ", "Borrar todo", "Tout effacer", "Alle löschen", "Limpar tudo", "Cancella tutto", "Очистить всё", "全部清除", "すべてクリア");
row("Back", "பின்", "वापस", "পিছনে", "ਵਾਪਸ", "Atrás", "Retour", "Zurück", "Voltar", "Indietro", "Назад", "返回", "戻る");
row("Download", "பதிவிறக்கு", "डाउनलोड", "ডাউনলোড", "ਡਾਊਨਲੋਡ", "Descargar", "Télécharger", "Herunterladen", "Baixar", "Scarica", "Скачать", "下载", "ダウンロード");
row("Review", "விமர்சனம்", "समीक्षा", "পর্যালোচনা", "ਸਮੀਖਿਆ", "Reseña", "Avis", "Bewertung", "Análise", "Recensione", "Отзыв", "评价", "レビュー");
row("Status", "நிலை", "स्थिति", "অবস্থা", "ਸਥਿਤੀ", "Estado", "Statut", "Status", "Situação", "Stato", "Статус", "状态", "ステータス");
row("Type", "வகை", "प्रकार", "ধরন", "ਕਿਸਮ", "Tipo", "Type", "Typ", "Tipo", "Tipo", "Тип", "类型", "タイプ");
row("Date", "தேதி", "तारीख", "তারিখ", "ਤਾਰੀਖ਼", "Fecha", "Date", "Datum", "Data", "Data", "Дата", "日期", "日付");
row("Time", "நேரம்", "समय", "সময়", "ਸਮਾਂ", "Hora", "Heure", "Zeit", "Hora", "Ora", "Время", "时间", "時間");
row("Duration", "காலஅளவு", "अवधि", "সময়কাল", "ਮਿਆਦ", "Duración", "Durée", "Dauer", "Duração", "Durata", "Продолжительность", "时长", "期間");
row("Amount", "தொகை", "राशि", "পরিমাণ", "ਰਕਮ", "Importe", "Montant", "Betrag", "Valor", "Importo", "Сумма", "金额", "金額");
row("Description", "விளக்கம்", "विवरण", "বিবরণ", "ਵੇਰਵਾ", "Descripción", "Description", "Beschreibung", "Descrição", "Descrizione", "Описание", "描述", "説明");
row("Details", "விவரங்கள்", "विवरण", "বিবরণ", "ਵੇਰਵੇ", "Detalles", "Détails", "Details", "Detalhes", "Dettagli", "Детали", "详情", "詳細");
row("Industry", "தொழில்நுட்பம்", "उद्योग", "শিল্প", "ਸਨਅਤ", "Sector", "Secteur", "Branche", "Setor", "Settore", "Отрасль", "行业", "業界");
row("Location", "இடம்", "स्थान", "অবস্থান", "ਥਾ", "Ubicación", "Emplacement", "Standort", "Localização", "Luogo", "Местоположение", "地点", "場所");
row("Company", "நிறுவனம்", "कंपनी", "কোম্পানি", "ਕੰਪਨੀ", "Empresa", "Entreprise", "Unternehmen", "Empresa", "Azienda", "Компания", "公司", "会社");
row("Position", "பதவி", "पद", "পদ", "ਪਦ", "Puesto", "Poste", "Position", "Cargo", "Posizione", "Должность", "职位", "役職");
row("Pending", "நிலுவையில்", "लंबित", "মুলতুবি", "ਲੰਭਿਤ", "Pendiente", "En attente", "Ausstehend", "Pendente", "In attesa", "В ожидании", "待处理", "保留中");
row("Accepted", "ஏற்கப்பட்டது", "स्वीकृत", "গৃহীত", "ਮੰਨਿਆ ਗਿਆ", "Aceptado", "Accepté", "Angenommen", "Aceito", "Accettato", "Принято", "已接受", "承認済み");
row("Declined", "நிராகரிக்கப்பட்டது", "अस्वीकृत", "প্রত্যাখ্যাত", "ਨਕਾਰਿਆ", "Rechazado", "Refusé", "Abgelehnt", "Recusado", "Rifiutato", "Отклонено", "已拒绝", "拒否");
row("Verified", "சரிபார்க்கப்பட்டது", "सत्यापित", "যাচাইকৃত", "ਤਸਦੀਕਸ਼ੁਦਾ", "Verificado", "Vérifié", "Verifiziert", "Verificado", "Verificato", "Проверено", "已认证", "認証済み");
row("Invest", "முதலீடு செய்", "निवेश करें", "বিনিয়োগ করুন", "ਨਿਵੇਗ ਕਰੋ", "Invertir", "Investir", "Investieren", "Investir", "Investi", "Инвестировать", "投资", "投資する");
row("Invested", "முதலீடு செய்தது", "निवेशित", "বিনিয়োগকৃত", "ਨਿਵੇਗ ਕੀਤਾ", "Invertido", "Investi", "Investiert", "Investido", "Investito", "Проинвестировано", "已投资", "投資済み");

// --- Sign in / register / OAuth --------------------------------------------
row("Sign in", "உள்நுழை", "साइन इन", "সাইন ইন", "ਸਾਈਨ ਇਨ", "Iniciar sesión", "Se connecter", "Anmelden", "Entrar", "Accedi", "Войти", "登录", "サインイン");
row("Sign in to your account", "உங்கள் கணக்கில் உள்நுழையவும்", "अपने खाते में साइन इन करें", "আপনার অ্যাকাউন্টে সাইন ইন করুন", "ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ", "Inicie sesión en su cuenta", "Connectez-vous à votre compte", "Bei Ihrem Konto anmelden", "Entre na sua conta", "Accedi al tuo account", "Войдите в свой аккаунт", "登录您的账户", "アカウントにサインイン");
row("Create account", "கணக்கு உருவாக்கு", "खाता बनाएँ", "অ্যাকাউন্ট তৈরি করুন", "ਖਾਤਾ ਬਣਾਓ", "Crear cuenta", "Créer un compte", "Konto erstellen", "Criar conta", "Crea account", "Создать аккаунт", "创建账户", "アカウント作成");
row("Create your account", "உங்கள் கணக்கை உருவாக்கவும்", "अपना खाता बनाएँ", "আপনার অ্যাকাউন্ট তৈরি করুন", "ਆਪਣਾ ਖਾਤਾ ਬਣਾਓ", "Cree su cuenta", "Créez votre compte", "Erstellen Sie Ihr Konto", "Crie sua conta", "Crea il tuo account", "Создайте аккаунт", "创建您的账户", "アカウントを作成");
row("Email", "மின்னஞ்சல்", "ईमेल", "ইমেইল", "ਈਮੇਲ", "Correo", "E-mail", "E-Mail", "E-mail", "E-mail", "Эл. почта", "电子邮箱", "メール");
row("Email address", "மின்னஞ்சல் முகவரி", "ईमेल पता", "ইমেইল ঠিকানা", "ਈਮੇਲ ਪਤਾ", "Dirección de correo", "Adresse e-mail", "E-Mail-Adresse", "Endereço de e-mail", "Indirizzo e-mail", "Адрес электронной почты", "电子邮箱地址", "メールアドレス");
row("Password", "கடவுச்சொல்", "पासवर्ड", "পাসওয়ার্ড", "ਪਾਸਵਰਡ", "Contraseña", "Mot de passe", "Passwort", "Senha", "Password", "Пароль", "密码", "パスワード");
row("Full Name", "முழு பெயர்", "पूरा नाम", "পুরো নাম", "ਪੂਰਾ ਨਾਮ", "Nombre completo", "Nom complet", "Vollständiger Name", "Nome completo", "Nome completo", "Полное имя", "全名", "氏名");
row("Role", "பங்கு", "भूमिका", "ভূমিকা", "ਭੂਮਿਕਾ", "Rol", "Rôle", "Rolle", "Função", "Ruolo", "Роль", "角色", "役割");
row("I am a...", "நான்... ஆவேன்", "मैं हूँ...", "আমি...", "ਮੈਂ... ਹਾਂ", "Soy...", "Je suis...", "Ich bin...", "Eu sou...", "Sono un...", "Я…", "我是…", "私は…");
row("Continue with Google", "Google மூலம் தொடரவும்", "Google से जारी रखें", "Google দিয়ে চালিয়ে যান", "Google ਨਾਲ ਜਾਰੀ ਰੱਖੋ", "Continuar con Google", "Continuer avec Google", "Mit Google fortfahren", "Continuar com o Google", "Continua con Google", "Продолжить с Google", "使用 Google 继续", "Google で続行");
row("Choose an account", "கணக்கை தேர்ந்தெடுக்கவும்", "खाता चुनें", "অ্যাকাউন্ট বাছুন", "ਖਾਤਾ ਚੁਣੋ", "Elija una cuenta", "Choisir un compte", "Konto auswählen", "Escolha uma conta", "Scegli un account", "Выберите аккаунт", "选择账户", "アカウントを選択");
row("to continue to", "தொடர", "जारी रखने के लिए", "চালিয়ে যেতে", "ਜਾਰੀ ਰੱਖਣ ਲਈ", "para continuar en", "pour continuer sur", "um fortzufahren auf", "para continuar no", "per continuare su", "чтобы продолжить в", "以继续访问", "を続行");
row("Use another account", "மற்றொரு கணக்கைப் பயன்படுத்தவும்", "दूसरा खाता उपयोग करें", "অন্য অ্যাকাউন্ট ব্যবহার করুন", "ਹੋਰ ਖਾਤਾ ਵਰਤੋ", "Usar otra cuenta", "Utiliser un autre compte", "Anderes Konto verwenden", "Usar outra conta", "Usa un altro account", "Использовать другой аккаунт", "使用其他账户", "別のアカウントを使う");
row("Google email address", "Google மின்னஞ்சல்", "Google ईमेल पता", "Google ইমেইল ঠিকানা", "Google ਈਮੇਲ ਪਤਾ", "Correo de Google", "Adresse e-mail Google", "Google-E-Mail", "E-mail do Google", "E-mail Google", "Эл. почта Google", "Google 邮箱", "Google アドレス");
row("Join as", "இந்த நிலையில் சேர", "इस रूप में जुड़ें", "হিসেবে যোগ দিন", "ਇਸ ਰੂਪ ਵਿੱਚ ਸ਼ਾਮਲ", "Unirse como", "Rejoindre en tant que", "Beitreten als", "Entrar como", "Unisciti come", "Присоединиться как", "以…身份加入", "次の立場で参加");
row("Sign in with Google", "Google மூலம் உள்நுழை", "Google से साइन इन", "Google দিয়ে সাইন ইন", "Google ਨਾਲ ਸਾਈਨ ਇਨ", "Iniciar sesión con Google", "Se connecter avec Google", "Mit Google anmelden", "Entrar com o Google", "Accedi con Google", "Войти через Google", "使用 Google 登录", "Google でサインイン");
row("Demo accounts (password 123)", "டெமோ கணக்குகள் (கடவுச்சொல் 123)", "डेमो खाते (पासवर्ड 123)", "ডেমো অ্যাকাউন্ট (পাসওয়ার্ড 123)", "ਡੈਮੋ ਖਾਤੇ (ਪਾਸਵਰਡ 123)", "Cuentas demo (contraseña 123)", "Comptes démo (mot de passe 123)", "Demo-Konten (Passwort 123)", "Contas demo (senha 123)", "Account demo (password 123)", "Демо-аккаунты (пароль 123)", "演示账户（密码 123）", "デモアカウント（パスワード 123）");
row("Min. 8 characters", "குறைந்தபட்சம் 8 எழுத்து", "न्यूनतम 8 अक्षर", "ন্যূনতম ৮ অক্ষর", "ਘੱਟੋ-ਘੱਟ 8 ਅੱਖਰ", "Mín. 8 caracteres", "Min. 8 caractères", "Min. 8 Zeichen", "Mín. 8 caracteres", "Min. 8 caratteri", "Мин. 8 символов", "至少 8 个字符", "最小8文字");
row("Sign out", "வெளியேறு", "साइन आउट", "সাইন আউট", "ਲਾਗ ਆਉਟ", "Cerrar sesión", "Se déconnecter", "Abmelden", "Sair", "Esci", "Выйти", "退出登录", "ログアウト");
