// k6-load-test.js - QUSIS デモデイ 耐久テストスクリプト
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// テスト設定
export const options = {
  scenarios: {
    // 軽いウォームアップ（5分）
    warmup: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 5 },   // 2分かけて5ユーザーまで増加
        { duration: '3m', target: 5 },   // 3分間5ユーザーを維持
      ],
    },
    
    // メイン耐久テスト（30分）
    durability_test: {
      executor: 'ramping-vus',
      startTime: '5m',  // ウォームアップ後に開始
      startVUs: 5,
      stages: [
        { duration: '5m', target: 20 },   // 20ユーザーまで増加
        { duration: '15m', target: 20 },  // 15分間20ユーザーを維持
        { duration: '5m', target: 50 },   // ピーク負荷50ユーザー
        { duration: '3m', target: 50 },   // 3分間ピーク維持
        { duration: '2m', target: 0 },    // 段階的に減少
      ],
    },
    
    // スパイクテスト（突発的な高負荷）
    spike_test: {
      executor: 'ramping-vus',
      startTime: '20m',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 }, // 30秒で100ユーザーに急増
        { duration: '1m', target: 100 },  // 1分間維持
        { duration: '30s', target: 0 },   // 急速に減少
      ],
    },
  },
  
  thresholds: {
    http_req_duration: ['p(95)<2000'],     // 95%のリクエストが2秒以内
    http_req_failed: ['rate<0.05'],        // エラー率5%未満
    http_reqs: ['rate>10'],                // 最低10req/sec
  },
};

// テスト用データ
const users = new SharedArray('users', function () {
  const userData = [];
  for (let i = 1; i <= 100; i++) {
    userData.push({
      email: `testuser${i}@example.com`,
      password: 'testpass123',
      name: `テストユーザー${i}`,
      role: i <= 80 ? 'viewer' : 'presenter',
      team: i > 80 ? `チーム${Math.ceil((i-80)/5)}` : null
    });
  }
  return userData;
});

const BASE_URL = 'https://qusis-demo-day-1.onrender.com';

// ユーザー登録
function registerUser(userData) {
  const response = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(userData), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'registration successful': (r) => r.status === 200,
    'got auth token': (r) => r.json().token !== undefined,
  });
  
  return response.status === 200 ? response.json() : null;
}

// ユーザーログイン
function loginUser(email, password) {
  const response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: email,
    password: password
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'login successful': (r) => r.status === 200,
    'got auth token': (r) => r.json().token !== undefined,
  });
  
  return response.status === 200 ? response.json() : null;
}

// ピッチ一覧取得
function getPitches(token) {
  const response = http.get(`${BASE_URL}/api/pitches`, {
    headers: { 'x-user-id': token },
  });
  
  check(response, {
    'pitches loaded': (r) => r.status === 200,
    'got pitches array': (r) => Array.isArray(r.json()),
  });
  
  return response.status === 200 ? response.json() : [];
}

// ピッチ作成（発表者のみ）
function createPitch(token, userData) {
  const pitchData = {
    title: `${userData.team}のピッチ - ${new Date().getTime()}`,
    description: `${userData.team}による革新的なアイデアのプレゼンテーション`,
    team: userData.team,
    presenterId: userData.id,
    presenterName: userData.name
  };
  
  const response = http.post(`${BASE_URL}/api/pitches`, JSON.stringify(pitchData), {
    headers: {
      'x-user-id': token,
      'Content-Type': 'application/json'
    },
  });
  
  check(response, {
    'pitch created': (r) => r.status === 201,
    'got pitch id': (r) => r.json()._id !== undefined,
  });
  
  return response.status === 201 ? response.json() : null;
}

// 投げ銭送信
function sendTip(token, pitchId) {
  const tipAmount = [10, 20, 50, 100][Math.floor(Math.random() * 4)];
  
  const response = http.post(`${BASE_URL}/api/tips`, JSON.stringify({
    pitchId: pitchId,
    amount: tipAmount,
    message: `${tipAmount}コインの応援です！`
  }), {
    headers: {
      'x-user-id': token,
      'Content-Type': 'application/json'
    },
  });
  
  check(response, {
    'tip sent successfully': (r) => r.status === 200,
  });
  
  return response.status === 200;
}

// チャットメッセージ送信
function sendMessage(token, pitchId) {
  const messages = [
    '素晴らしいアイデアですね！',
    '頑張ってください！',
    '応援しています！',
    'とても興味深いです',
    '成功を祈っています！'
  ];
  
  const response = http.post(`${BASE_URL}/api/messages`, JSON.stringify({
    pitchId: pitchId,
    content: messages[Math.floor(Math.random() * messages.length)]
  }), {
    headers: {
      'x-user-id': token,
      'Content-Type': 'application/json'
    },
  });
  
  check(response, {
    'message sent successfully': (r) => r.status === 200,
  });
  
  return response.status === 200;
}

// コイン残高確認
function checkBalance(token) {
  const response = http.get(`${BASE_URL}/api/coins/balance`, {
    headers: { 'x-user-id': token },
  });
  
  check(response, {
    'balance check successful': (r) => r.status === 200,
    'got balance data': (r) => r.json().balance !== undefined,
  });
  
  return response.status === 200 ? response.json() : null;
}

// コイン獲得（時間貢献）
function earnCoins(token) {
  const contributionTypes = ['オフラインヒアリング', 'オンラインヒアリング', 'QUSISイベント参加'];
  
  const response = http.post(`${BASE_URL}/api/contributions`, JSON.stringify({
    type: contributionTypes[Math.floor(Math.random() * contributionTypes.length)],
    hours: Math.floor(Math.random() * 3) + 1  // 1-3時間
  }), {
    headers: {
      'x-user-id': token,
      'Content-Type': 'application/json'
    },
  });
  
  check(response, {
    'coins earned successfully': (r) => r.status === 201,
  });
  
  return response.status === 201;
}

// メインテストシナリオ
export default function () {
  const userIndex = __VU % users.length;
  const userData = users[userIndex];
  
  // 1. ユーザー登録またはログイン
  let authData = loginUser(userData.email, userData.password);
  
  if (!authData) {
    // ログインに失敗した場合は新規登録
    authData = registerUser(userData);
    if (!authData) {
      console.log('認証に失敗しました');
      return;
    }
  }
  
  const token = authData.token;
  const user = authData.user;
  
  sleep(1);
  
  // 2. ピッチ一覧を取得
  const pitches = getPitches(token);
  sleep(2);
  
  // 3. 発表者の場合：ピッチを作成
  if (user.role === 'presenter' && Math.random() < 0.3) {
    createPitch(token, user);
    sleep(2);
  }
  
  // 4. ランダムな行動を選択
  const actions = [];
  
  if (pitches.length > 0) {
    const randomPitch = pitches[Math.floor(Math.random() * pitches.length)];
    
    // 投げ銭（50%の確率）
    if (Math.random() < 0.5) {
      actions.push(() => sendTip(token, randomPitch._id));
    }
    
    // チャット投稿（70%の確率）
    if (Math.random() < 0.7) {
      actions.push(() => sendMessage(token, randomPitch._id));
    }
  }
  
  // コイン残高確認（30%の確率）
  if (Math.random() < 0.3) {
    actions.push(() => checkBalance(token));
  }
  
  // コイン獲得（20%の確率）
  if (Math.random() < 0.2) {
    actions.push(() => earnCoins(token));
  }
  
  // アクションを実行
  actions.forEach((action, index) => {
    action();
    if (index < actions.length - 1) {
      sleep(Math.random() * 3 + 1); // 1-4秒の間隔
    }
  });
  
  sleep(Math.random() * 5 + 2); // 2-7秒休憩
}

// セットアップ（テスト開始前に実行）
export function setup() {
  console.log('🚀 QUSIS デモデイ 耐久テスト開始');
  console.log(`📊 対象URL: ${BASE_URL}`);
  console.log('📝 テストシナリオ:');
  console.log('   - ユーザー登録/ログイン');
  console.log('   - ピッチ一覧取得');
  console.log('   - ピッチ作成（発表者）');
  console.log('   - 投げ銭送信');
  console.log('   - チャットメッセージ送信');
  console.log('   - コイン残高確認');
  console.log('   - コイン獲得（時間貢献）');
}

// クリーンアップ（テスト終了後に実行）
export function teardown(data) {
  console.log('✅ QUSIS デモデイ 耐久テスト完了');
}