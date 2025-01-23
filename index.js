let time = 5 * 60 * 1000;
let remainingTime = null;
let startTime = null;
let timerId = null;
let isCountdownTimer = true;
const maxMinutes = 100;

// プレイヤー関連のグローバル変数
let player;
let isPlaying = false;

const internalButton = document.getElementById("internal-button");
const externalButton = document.getElementById("external-button");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const resetButton = document.getElementById("reset-button");
const setupButton = document.getElementById("setup-button");

// 時間表示更新関数
const updateTimeText = (time) => {
  let m = Math.floor(time / (1000 * 60)) % 100;
  let s = Math.floor((time % (1000 * 60)) / 1000);
  let ms = time % 1000;

  m = `0${m}`.slice(-2);
  s = `0${s}`.slice(-2);
  ms = `00${ms}`.slice(-3).slice(0, 2);

  setTimer(m, s, ms);
};

const setTimer = (m, s, ms) => {
  document.getElementById("minute").textContent = m;
  document.getElementById("second").textContent = s;
  document.getElementById("millisecond").textContent = ms;
};

// タイマー更新処理
const update = () => {
  timerId = setTimeout(() => {
    const now = Date.now();
    isCountdownTimer 
      ? remainingTime -= now - startTime
      : remainingTime += now - startTime;

    startTime = now;
    remainingTime = Math.max(remainingTime, 0);
    updateTimeText(remainingTime);

    if (remainingTime > 0) update();
  }, 10);
};

// モード切替処理
const internalAction = () => {
  isCountdownTimer = true;
  resetAction();
  internalButton.classList.remove("disabled");
  externalButton.classList.add("disabled");
  setupButton.classList.add("active-control");
};

const externalAction = () => {
  isCountdownTimer = false;
  resetAction();
  externalButton.classList.remove("disabled");
  internalButton.classList.add("disabled");
  setupButton.classList.remove("active-control");
};

// スタート/ストップ処理
const startAction = () => {
  if (timerId !== null) return;

  startTime = Date.now();
  update();
  startButton.classList.remove("active-control");
  stopButton.classList.add("active-control");
  if (!isPlaying) togglePlay();
};

const stopAction = () => {
  if (timerId === null) return;

  clearTimeout(timerId);
  timerId = null;
  stopButton.classList.remove("active-control");
  startButton.classList.add("active-control");
  if (isPlaying) togglePlay(); // 動画も停止
};

// リセット・セットアップ
const resetAction = () => {
  remainingTime = isCountdownTimer ? time : 0;
  updateTimeText(remainingTime);
};

const setupAction = () => {
  if (!isCountdownTimer) return;
  time = (time + 60 * 1000) % (maxMinutes * 60 * 1000);
  resetAction();
};

// YouTubeプレイヤー関連
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: 'o1Eo3VW693Q',
    playerVars: {
      'autoplay': 0,
      'controls': 0,
      'rel': 0,
      'fs': 0
    },
    events: {
      'onReady': () => console.log('プレイヤー準備完了'),
      'onStateChange': (e) => {
        if (e.data === YT.PlayerState.ENDED) resetAction();
      }
    }
  });
}

function togglePlay() {
  const btn = document.querySelector('.control-btn');
  isPlaying = !isPlaying;
  
  if (isPlaying) {
    player.playVideo();
   // btn.textContent = '⏸ 一時停止';
    document.getElementById('player').style.opacity = '1';
  } else {
    player.pauseVideo();
  //  btn.textContent = '▶ 再生';
    document.getElementById('player').style.opacity = '0.3';
  }
}

// 初期化処理
(() => {
  // イベントリスナー登録
  internalButton.addEventListener("click", internalAction);
  externalButton.addEventListener("click", externalAction);
  startButton.addEventListener("click", startAction);
  stopButton.addEventListener("click", stopAction);
  resetButton.addEventListener("click", resetAction);
  setupButton.addEventListener("click", setupAction);

  // URLパラメータ処理
  const urlParams = new URLSearchParams(window.location.search);
  const timeParam = parseFloat(urlParams.get("time"));
  if (!isNaN(timeParam) && timeParam >= 0 && timeParam < maxMinutes) {
    time = timeParam * 60 * 1000;
  }

  if (urlParams.has("stopwatch")) externalAction();

  // YouTube API読み込み
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  // キーボードショートカット
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    }
  });

  resetAction();
})();
