// conversion-logic.js
// ネガティブ→ポジティブ変換ロジック

// 要素パターンの定義
const conversionPatterns = {
    // 時間表現
    time: [
        { regex: /(今日|きょう)/, value: '今日' },
        { regex: /(昨日|きのう)/, value: '昨日' },
        { regex: /(午前|朝)/, value: '午前' },
        { regex: /(午後|昼)/, value: '午後' },
        { regex: /(夜|晩)/, value: '夜' }
    ],
    
    // 場所・シーン
    places: [
        { regex: /会議/, value: '会議' },
        { regex: /職場|会社|オフィス/, value: '職場' },
        { regex: /家|自宅/, value: '家' },
        { regex: /駅|電車/, value: '移動中' },
        { regex: /(川沿い|公園|散歩)/, value: '散歩' },
        { regex: /カフェ|喫茶/, value: 'カフェ' }
    ],
    
    // 行動
    actions: [
        { regex: /(会議|ミーティング|打ち合わせ)/, value: '会議', positive: '議論' },
        { regex: /(発表|プレゼン|説明)/, value: '発表', positive: '発表' },
        { regex: /(資料|書類|レポート).{0,5}(作|書)/, value: '資料作成', positive: '資料作り' },
        { regex: /歩(く|いて|いた|き)/, value: '散歩', positive: '散歩' },
        { regex: /(話|連絡|メール|電話)/, value: 'コミュニケーション', positive: '交流' },
        { regex: /(勉強|学習|練習)/, value: '学習', positive: '学び' },
        { regex: /(読|読む|読んだ)/, value: '読書', positive: '読書' },
        { regex: /(運動|ジョギング|ランニング)/, value: '運動', positive: '運動' },
        { regex: /(料理|調理|作っ)/, value: '料理', positive: '料理' }
    ],
    
    // ネガティブ表現とその変換
    negatives: [
        { regex: /できなかった/, original: 'できなかった', converted: '挑戦できた', context: '挑戦' },
        { regex: /うまく(.{1,5})できなかった/, original: 'うまくできなかった', converted: '経験を積めた', context: '経験' },
        { regex: /間に合わなかった/, original: '間に合わなかった', converted: '取り組んだ', context: '努力' },
        { regex: /失敗(した|して)/, original: '失敗', converted: '挑戦した', context: '挑戦' },
        { regex: /ダメ(だった|だ)/, original: 'ダメ', converted: '学びがあった', context: '学び' },
        { regex: /疲れて(しまった|しまい)/, original: '疲れてしまった', converted: '全力で取り組めた', context: '全力' },
        { regex: /疲れた/, original: '疲れた', converted: 'やり遂げた', context: '達成' },
        { regex: /落ち込(んだ|んで)/, original: '落ち込んだ', converted: '向き合えた', context: '自己理解' },
        { regex: /うまくいかなかった/, original: 'うまくいかなかった', converted: '次への糧になった', context: '成長' },
        { regex: /長引(き|いて|いた)/, original: '長引き', converted: 'しっかり取り組めて', context: '集中' },
        { regex: /不安(だった|で|な)/, original: '不安', converted: '向き合えた', context: '自己理解' },
        { regex: /辛(い|かった)/, original: '辛い', converted: '乗り越えようとした', context: '挑戦' },
        { regex: /苦しい|苦しかった/, original: '苦しい', converted: '頑張れた', context: '努力' }
    ],
    
    // ポジティブ表現
    positives: [
        { regex: /(嬉しい|嬉しかった)/, value: '嬉しい' },
        { regex: /(楽しい|楽しかった)/, value: '楽しい' },
        { regex: /(良かった|よかった)/, value: '良かった' },
        { regex: /(ほっとした|安心)/, value: 'ほっとした' },
        { regex: /(癒され|癒やされ)/, value: '癒された' },
        { regex: /心がほどけて/, value: '心がほどけた' },
        { regex: /(静か|穏やか)/, value: '穏やかな気持ち' },
        { regex: /(励まし|支え|助け)/, value: '支えがあった' },
        { regex: /(頑張|がんば)/, value: '頑張る気持ち' },
        { regex: /(満足|充実)/, value: '充実感' },
        { regex: /(感謝|ありがた)/, value: '感謝の気持ち' }
    ],
    
    // 人物
    people: [
        { regex: /(友人|友達|友だち)/, value: '友人' },
        { regex: /(同僚|同期)/, value: '同僚' },
        { regex: /(先輩|上司)/, value: '先輩' },
        { regex: /(後輩|部下)/, value: '後輩' },
        { regex: /(家族|親|兄|姉|弟|妹)/, value: '家族' }
    ]
};

// テキストから要素を抽出
function analyzeText(text) {
    const analysis = {
        time: [],
        places: [],
        actions: [],
        negatives: [],
        positives: [],
        people: []
    };
    
    // 各パターンでマッチング
    conversionPatterns.time.forEach(p => {
        if (text.match(p.regex)) {
            if (!analysis.time.includes(p.value)) {
                analysis.time.push(p.value);
            }
        }
    });
    
    conversionPatterns.places.forEach(p => {
        if (text.match(p.regex)) {
            if (!analysis.places.includes(p.value)) {
                analysis.places.push(p.value);
            }
        }
    });
    
    conversionPatterns.actions.forEach(p => {
        if (text.match(p.regex)) {
            analysis.actions.push({ original: p.value, positive: p.positive });
        }
    });
    
    conversionPatterns.negatives.forEach(p => {
        if (text.match(p.regex)) {
            analysis.negatives.push({
                original: p.original,
                converted: p.converted,
                context: p.context
            });
        }
    });
    
    conversionPatterns.positives.forEach(p => {
        if (text.match(p.regex)) {
            if (!analysis.positives.includes(p.value)) {
                analysis.positives.push(p.value);
            }
        }
    });
    
    conversionPatterns.people.forEach(p => {
        if (text.match(p.regex)) {
            if (!analysis.people.includes(p.value)) {
                analysis.people.push(p.value);
            }
        }
    });
    
    return analysis;
}

// 自然な文章を生成
function generateNaturalText(analysis) {
    const sentences = [];
    
    // 文章の構造を決定
    const hasNegative = analysis.negatives.length > 0;
    const hasPositive = analysis.positives.length > 0;
    const hasActions = analysis.actions.length > 0;
    const hasPeople = analysis.people.length > 0;
    
    // パターン1: ネガティブがある場合
    if (hasNegative) {
        // 最初の文: 行動 + 学び/成長
        if (hasActions && analysis.actions.length > 0) {
            const action = analysis.actions[0].positive;
            const context = analysis.negatives[0].context;
            sentences.push(`${action}を通じて、${context}の機会があった`);
        } else {
            sentences.push(`様々なことに取り組み、学びの機会があった`);
        }
        
        // 2番目の文: ポジティブ要素があれば追加
        if (hasPositive) {
            const positive = analysis.positives[0];
            if (hasPeople) {
                const person = analysis.people[0];
                sentences.push(`${person}との時間で${positive}気持ちになれた`);
            } else {
                sentences.push(`${positive}瞬間もあった`);
            }
        } else {
            sentences.push(`課題も見つかり、次に活かせる`);
        }
        
        // 最後の文: 前向きな締め
        sentences.push(`一歩ずつ成長している!`);
    }
    // パターン2: ポジティブのみ
    else if (hasPositive) {
        // 最初の文: 行動 + ポジティブ
        if (hasActions && analysis.actions.length > 0) {
            const action = analysis.actions[0].positive;
            const positive = analysis.positives[0];
            sentences.push(`${action}を通じて、${positive}時間を過ごせた`);
        } else {
            const positive = analysis.positives[0];
            sentences.push(`${positive}一日だった`);
        }
        
        // 2番目の文: 人とのつながりがあれば
        if (hasPeople) {
            const person = analysis.people[0];
            sentences.push(`${person}との交流も心に残った`);
        } else if (analysis.positives.length > 1) {
            sentences.push(`${analysis.positives[1]}気持ちも味わえた`);
        } else {
            sentences.push(`心が満たされる時間になった`);
        }
        
        // 最後の文
        sentences.push(`充実した時間になった!`);
    }
    // パターン3: 行動のみ
    else if (hasActions) {
        const actions = analysis.actions.slice(0, 2).map(a => a.positive);
        if (actions.length === 1) {
            sentences.push(`${actions[0]}に集中して取り組めた`);
        } else {
            sentences.push(`${actions[0]}や${actions[1]}に取り組めた`);
        }
        
        // 人がいれば追加
        if (hasPeople) {
            const person = analysis.people[0];
            sentences.push(`${person}と過ごす時間もあった`);
        } else {
            sentences.push(`それぞれの経験が自分の糧になる`);
        }
        
        sentences.push(`今日も頑張れた!`);
    }
    // パターン4: 要素が少ない場合
    else {
        sentences.push(`今日も自分なりに過ごせた`);
        
        if (hasPeople) {
            const person = analysis.people[0];
            sentences.push(`${person}との時間を大切にできた`);
        } else {
            sentences.push(`小さな一歩も大切にしていきたい`);
        }
    }
    
    // 文章を結合（100文字以内に調整）
    let result = '';
    for (const sentence of sentences) {
        const newText = result + sentence + '。';
        if (newText.length > 100) {
            // 最後の文を短縮版に
            if (result.length < 85) {
                result += '成長できている!';
            }
            break;
        }
        result = newText;
    }
    
    // 100文字を超えている場合は調整
    if (result.length > 100) {
        // 最後の文を削って調整
        const lastPeriod = result.lastIndexOf('。', 95);
        if (lastPeriod > 50) {
            result = result.substring(0, lastPeriod + 1);
        }
    }
    
    return result.trim();
}

// メイン変換関数
function convertToPositive(text) {
    const analysis = analyzeText(text);
    return generateNaturalText(analysis);
}
