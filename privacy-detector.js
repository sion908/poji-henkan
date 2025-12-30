// privacy-detector.js
// 個人情報検出とマスキング機能

// 正規表現パターン
const privacyPatterns = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /0\d{1,4}-?\d{1,4}-?\d{4}|0\d{9,10}/g,
    url: /https?:\/\/[^\s<>]+/g,
    postalCode: /〒?\d{3}-?\d{4}/g
};

// 日本の都道府県・主要市区町村リスト
const places = [
    // 都道府県
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
    '岐阜県', '静岡県', '愛知県', '三重県',
    '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
    // 主要都市
    '札幌市', '仙台市', '新潟市', '横浜市', '川崎市', '名古屋市', '京都市', '大阪市', '神戸市',
    '広島市', '北九州市', '福岡市', '熊本市', '鹿児島市', '那覇市',
    // 長崎県の市町村
    '長崎市', '佐世保市', '島原市', '諫早市', '大村市', '平戸市', '松浦市', '対馬市', '壱岐市', '五島市', '西海市', '雲仙市', '南島原市',
    '長与町', '時津町', '東彼杵町', '川棚町', '波佐見町',
    // 大村市の詳細地名
    '水主町', '竹松本町', '古賀島町', '富の原', '東本町', '西本町',
    // その他主要地名
    '渋谷', '新宿', '池袋', '品川', '横浜', '川崎', '梅田', '難波', '天神', '博多'
];

// 日本人の一般的な姓
const surnames = [
    '佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
    '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水',
    '山崎', '森', '池田', '橋本', '阿部', '石川', '山下', '中島', '石井', '小川',
    '前田', '岡田', '長谷川', '藤田', '後藤', '近藤', '村上', '遠藤', '青木', '坂本',
    '西村', '福田', '太田', '岡本', '藤井', '西田', '中川', '原田', '中野', '藤原'
];

// 人名検出関数
function detectNames(text) {
    const detected = [];
    
    // パターン1: 姓名+敬称
    const pattern1 = new RegExp(`(${surnames.join('|')})[一-龠ぁ-んァ-ヶー]+(さん|くん|ちゃん|様|氏)`, 'g');
    let match;
    while ((match = pattern1.exec(text)) !== null) {
        detected.push({
            text: match[0],
            index: match.index,
            type: '人名'
        });
    }
    
    return detected;
}

// 地名検出関数
function detectPlaces(text) {
    const detected = [];
    
    // 長い地名から先にチェック（例: 「大村市水主町」より「大村市」が先にマッチしないように）
    const sortedPlaces = [...places].sort((a, b) => b.length - a.length);
    
    sortedPlaces.forEach(place => {
        let index = text.indexOf(place);
        while (index !== -1) {
            // 既に検出済みの範囲と重複していないかチェック
            const isOverlap = detected.some(det => 
                (index >= det.index && index < det.index + det.text.length) ||
                (index + place.length > det.index && index < det.index + det.text.length)
            );
            
            if (!isOverlap) {
                detected.push({
                    text: place,
                    index: index,
                    type: '地名'
                });
            }
            
            index = text.indexOf(place, index + 1);
        }
    });
    
    return detected.sort((a, b) => a.index - b.index);
}

// 個人情報をマスキング
function maskPersonalInfo(text) {
    const allDetections = [];
    
    // メールアドレス
    let match;
    const emailRegex = new RegExp(privacyPatterns.email);
    while ((match = emailRegex.exec(text)) !== null) {
        allDetections.push({
            text: match[0],
            index: match.index,
            type: 'メールアドレス',
            replacement: '[メールアドレス]'
        });
    }
    
    // 電話番号
    const phoneRegex = new RegExp(privacyPatterns.phone);
    while ((match = phoneRegex.exec(text)) !== null) {
        allDetections.push({
            text: match[0],
            index: match.index,
            type: '電話番号',
            replacement: '[電話番号]'
        });
    }
    
    // URL
    const urlRegex = new RegExp(privacyPatterns.url);
    while ((match = urlRegex.exec(text)) !== null) {
        allDetections.push({
            text: match[0],
            index: match.index,
            type: 'URL',
            replacement: '[URL]'
        });
    }
    
    // 郵便番号
    const postalRegex = new RegExp(privacyPatterns.postalCode);
    while ((match = postalRegex.exec(text)) !== null) {
        allDetections.push({
            text: match[0],
            index: match.index,
            type: '郵便番号',
            replacement: '[郵便番号]'
        });
    }
    
    // 人名
    detectNames(text).forEach(det => {
        allDetections.push({
            ...det,
            replacement: '友人'
        });
    });
    
    // 地名
    detectPlaces(text).forEach(det => {
        allDetections.push({
            ...det,
            replacement: '近所'
        });
    });
    
    // インデックスの降順でソート（後ろから置換）
    allDetections.sort((a, b) => b.index - a.index);
    
    // マスキング実行
    let masked = text;
    allDetections.forEach(det => {
        masked = masked.substring(0, det.index) + 
                 det.replacement + 
                 masked.substring(det.index + det.text.length);
    });
    
    return masked;
}
