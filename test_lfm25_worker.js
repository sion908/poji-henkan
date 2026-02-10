// LFM2.5 テスト用 WebWorker
// フェーズ1：プロンプト最適化版

// Transformers.jsを動的インポート
importScripts('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.0/dist/transformers.min.js');

// 環境設定
env.allowLocalModels = true;
env.useBrowserCache = true;

let generator = null;
let currentModelId = null;

// メッセージ受信
self.addEventListener('message', async (event) => {
    const { type, data } = event.data;

    try {
        switch (type) {
            case 'load':
                await loadModel(data.modelId);
                break;
            case 'convert':
                await convertToPositive(data.text);
                break;
            case 'check':
                self.postMessage({ status: 'ready' });
                break;
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (err) {
        self.postMessage({
            status: 'error',
            error: err.message
        });
    }
});

async function loadModel(modelId = 'Xenova/LaMini-111M') {
    if (generator && currentModelId === modelId) {
        self.postMessage({ status: 'loaded', modelId });
        return;
    }

    if (generator) {
        generator = null;
    }

    self.postMessage({ status: 'loading', modelId });

    try {
        // テスト用の軽量モデルをロード
        generator = await pipeline('text-generation', modelId, {
            device: 'webgpu',
            dtype: 'q8',
            progress_callback: (progress) => {
                self.postMessage({
                    status: 'progress',
                    progress: progress
                });
            }
        });

        currentModelId = modelId;
        self.postMessage({ status: 'loaded', modelId });

    } catch (e) {
        console.error('Model load error:', e);
        throw e;
    }
}

async function convertToPositive(text) {
    if (!generator) {
        throw new Error('Model not loaded');
    }

    self.postMessage({ status: 'converting' });

    // フェーズ1：プロンプト最適化
    const prompt = createOptimizedPrompt(text);

    try {
        const result = await generator(prompt, {
            max_new_tokens: 120,
            temperature: 0.3,
            do_sample: true,
            top_k: 50,
            top_p: 0.9,
            repetition_penalty: 1.1
        });

        // 出力の整形
        let outputText = result[0].generated_text;
        
        // プロンプト部分を削除
        if (outputText.startsWith(prompt)) {
            outputText = outputText.substring(prompt.length).trim();
        }

        // 不要な記号を削除
        outputText = outputText.replace(/^["'「」]|["'「」]$/g, '').trim();

        // 文字数チェック
        if (outputText.length > 120) {
            outputText = outputText.substring(0, 117) + '...';
        }

        self.postMessage({
            status: 'complete',
            output: outputText,
            original: text,
            prompt: prompt
        });

    } catch (e) {
        console.error('Conversion error:', e);
        throw e;
    }
}

function createOptimizedPrompt(text) {
    return `以下の文章をポジティブな表現に変換してください。

ルール：
1. 120文字以内
2. 個人情報（名前、場所）を削除またはぼかす
3. ネガティブな表現をポジティブに変換
4. 優しい・落ち着いた文体
5. SNS投稿に適した自然な文章

例：
入力：今日の朝、長崎市の〇〇カフェで友人の佐藤翔太と話をした。仕事の悩みを聞いてもらい気持ちが軽くなった。
出力：朝にカフェで友人と話し、気持ちが軽くなった。穏やかな時間を過ごせた。

入力：職場でのプレゼンが失敗して落ち込んだ。準備不足だった。
出力：プレゼンに挑戦し、学びの機会があった。次に活かせる経験ができた。

対象の文章：
${text}

変換後の文章：`;
}
