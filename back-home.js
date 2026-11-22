// Nút quay về trang chủ
const homeButton = document.createElement("a");

homeButton.href = "/tn/";
homeButton.innerHTML = "← Trang chủ";

homeButton.style.cssText = `
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 9999;
  padding: 12px 20px;
  background: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 30px;
  text-decoration: none;
  font-family: Arial, sans-serif;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
  transition: 0.2s;
`;

homeButton.onmouseover = () => {
  homeButton.style.transform = "translateY(-2px)";
};

homeButton.onmouseout = () => {
  homeButton.style.transform = "translateY(0)";
};

document.body.appendChild(homeButton);

/* =====================================================================
   NÚT "XÁO CÂU – TẠO ĐỀ MỚI"
   Dùng cho: tracnghiem92cau.html (92 câu) và tracnghiem270.html (270 câu).
   Mỗi lần bấm: xáo ngân hàng câu hỏi, chọn ngẫu nhiên 20 câu (thứ tự câu
   cũng ngẫu nhiên) và mở thành một đề mới. Trang index.html không bị ảnh hưởng.
   ===================================================================== */
(function () {
  var RANDOM_SIZE = 20;

  // Xáo trộn Fisher-Yates, trả về mảng mới
  function shuffled(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /* ------------------------- TRANG 270 CÂU ------------------------- */
  function patch270() {
    if (typeof EXAMS === "undefined" || typeof NORMALIZED_QUESTIONS === "undefined" || typeof loadExam !== "function") return;

    var controls = document.querySelector(".header-controls");
    if (!controls) return;

    var randomExamIndex = -1; // vị trí tab "Đề ngẫu nhiên" trong EXAMS
    var round = 0;

    function createRandomExam() {
      round++;
      var total = NORMALIZED_QUESTIONS.length;
      var picked = shuffled(NORMALIZED_QUESTIONS).slice(0, Math.min(RANDOM_SIZE, total));
      var exam = {
        index: 0,
        label: "Đề ngẫu nhiên #" + round,
        range: picked.length + " câu xáo từ " + total,
        questions: picked
      };
      if (randomExamIndex === -1) {
        randomExamIndex = EXAMS.length;
        EXAMS.push(exam);
      } else {
        EXAMS[randomExamIndex] = exam;
      }
      exam.index = randomExamIndex;
      loadExam(randomExamIndex);

      var tabs = document.getElementById("exam-tabs-container");
      if (tabs) tabs.scrollLeft = tabs.scrollWidth;
    }

    // Nút trên thanh đầu trang
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btn-random-exam";
    btn.className = "btn btn-primary";
    btn.textContent = "↻ Xáo câu – Tạo đề mới (20 câu)";
    btn.title = "Chọn ngẫu nhiên 20 câu trong " + NORMALIZED_QUESTIONS.length + " câu và tạo một đề mới";
    btn.addEventListener("click", createRandomExam);
    var resetBtn = document.getElementById("btn-reset-top");
    controls.insertBefore(btn, resetBtn || controls.firstChild);

    // Nút trong bảng kết quả sau khi nộp bài
    var retryBanner = document.getElementById("btn-retry-banner");
    if (retryBanner && retryBanner.parentNode) {
      var wrap = document.createElement("div");
      wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;";
      retryBanner.parentNode.insertBefore(wrap, retryBanner);
      wrap.appendChild(retryBanner);

      var btn2 = document.createElement("button");
      btn2.type = "button";
      btn2.className = "btn btn-outline";
      btn2.textContent = "↻ Xáo câu – Tạo đề mới";
      btn2.addEventListener("click", createRandomExam);
      wrap.appendChild(btn2);
    }

    var subtitle = document.querySelector(".site-subtitle");
    if (subtitle) {
      subtitle.textContent =
        "Mỗi đề 20 câu theo đúng thứ tự tài liệu • Bấm “Xáo câu” để tạo đề ngẫu nhiên 20 câu • Giải thích chi tiết từng đáp án";
    }
  }

  /* ------------------------- TRANG 92 CÂU -------------------------- */
  function patch92() {
    var setSelector = document.getElementById("set-selector");
    if (!setSelector) return;
    if (
      typeof state === "undefined" ||
      typeof QUIZ_DATA === "undefined" ||
      typeof TEST_SETS === "undefined" ||
      typeof initTest !== "function"
    ) {
      console.warn("Trang 92 câu có cấu trúc khác dự kiến, không thể thêm nút xáo câu.");
      return;
    }

    var RANDOM_KEY = "random20";

    // Nếu trang chưa có nút (hoặc nút bị thiếu) thì tự tạo ngay cạnh ô chọn bộ đề
    var randomBtn = document.getElementById("random-test-btn");
    if (!randomBtn) {
      randomBtn = document.createElement("button");
      randomBtn.id = "random-test-btn";
      randomBtn.type = "button";
      randomBtn.className =
        "inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-2.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer";
      randomBtn.innerHTML = "<span>Xáo câu</span>";
      setSelector.parentNode.insertBefore(randomBtn, setSelector.nextSibling);
    }
    if (!setSelector.querySelector('option[value="' + RANDOM_KEY + '"]')) {
      var extraOpt = document.createElement("option");
      extraOpt.value = RANDOM_KEY;
      extraOpt.textContent = "Đề xáo câu";
      setSelector.appendChild(extraOpt);
    }
    var randomRound = 0;
    var forceNew = false;

    // Dựng danh sách câu hỏi. Ở chế độ xáo câu: đảo ngẫu nhiên thứ tự cả 92 câu,
    // giữ nguyên thứ tự đó khi "Làm lại" cho tới khi bấm nút tạo đề mới.
    window.buildQuestionList = function () {
      var isRandom = state.currentSetKey === RANDOM_KEY;
      var rawSlice;

      if (isRandom) {
        if (forceNew || !state.randomIds) {
          randomRound++;
          state.randomIds = shuffled(QUIZ_DATA).map(function (q) { return q.id; });
          forceNew = false;
        }
        rawSlice = state.randomIds.map(function (id) {
          return QUIZ_DATA.find(function (q) { return q.id === id; });
        });
        var opt = setSelector.querySelector('option[value="' + RANDOM_KEY + '"]');
        if (opt) opt.textContent = "Đề xáo câu #" + randomRound + " (" + rawSlice.length + " câu)";
      } else {
        state.randomIds = null;
        if (state.currentSetKey === "all") {
          rawSlice = QUIZ_DATA;
        } else {
          var cfg = TEST_SETS[parseInt(state.currentSetKey, 10)];
          rawSlice = QUIZ_DATA.slice(cfg.start, cfg.end);
        }
      }

      state.renderedQuestions = rawSlice.map(function (q) {
        var opts = q.options.map(function (text, i) {
          return { text: text, isCorrect: i === q.correctIndex };
        });
        var finalOpts = state.shuffleOptions ? shuffled(opts) : opts;
        return {
          id: q.id,
          question: q.question,
          options: finalOpts,
          correctIndex: finalOpts.findIndex(function (o) { return o.isCorrect; }),
          explanation: q.explanation
        };
      });
    };

    // Ở chế độ xáo câu, đánh lại số thứ tự 1..92 theo thứ tự mới (thay vì số câu gốc)
    var origRenderTOC = window.renderTOC;
    window.renderTOC = function () {
      origRenderTOC();
      if (state.currentSetKey !== RANDOM_KEY) return;
      state.renderedQuestions.forEach(function (q, i) {
        var b = document.getElementById("toc-btn-" + q.id);
        if (b) {
          b.textContent = i + 1;
          b.title = "Đi tới Câu " + (i + 1);
        }
      });
    };

    var origRenderQuestions = window.renderQuestions;
    window.renderQuestions = function () {
      origRenderQuestions();
      if (state.currentSetKey !== RANDOM_KEY) return;
      state.renderedQuestions.forEach(function (q, i) {
        var card = document.getElementById("question-card-" + q.id);
        var badge = card && card.querySelector("span");
        if (badge) {
          badge.textContent = "Câu " + (i + 1);
          badge.title = "Câu số " + q.id + " trong ngân hàng";
        }
      });
    };

    // Sau khi nộp bài ở đề ngẫu nhiên: hiện nút tạo đề mới, ẩn nút "đề tiếp theo"
    var newAfterBtn = document.getElementById("new-random-after-submit-btn");
    var nextSetBtn = document.getElementById("next-set-btn");
    var origGrade = window.gradeQuiz;
    window.gradeQuiz = function () {
      origGrade();
      var isRandom = state.currentSetKey === RANDOM_KEY;
      if (newAfterBtn) newAfterBtn.classList.toggle("hidden", !isRandom);
      if (isRandom && nextSetBtn) nextSetBtn.classList.add("hidden");
    };

    function newRandomExam() {
      state.currentSetKey = RANDOM_KEY;
      setSelector.value = RANDOM_KEY;
      forceNew = true;
      initTest(true);
    }

    // Thay nút cũ (đang gắn trình xử lý lỗi) bằng bản sao sạch
    var fresh = randomBtn.cloneNode(true);
    randomBtn.parentNode.replaceChild(fresh, randomBtn);
    fresh.addEventListener("click", newRandomExam);
    var label = fresh.querySelector("span");
    if (label) label.textContent = "Xáo câu · Tạo đề mới (" + QUIZ_DATA.length + " câu)";
    fresh.title = "Đảo ngẫu nhiên thứ tự cả " + QUIZ_DATA.length + " câu và tạo một đề mới";

    if (newAfterBtn) {
      newAfterBtn.textContent = "Xáo câu · Tạo đề mới ↻";
      newAfterBtn.addEventListener("click", newRandomExam);
    }
  }

  try {
    if (document.getElementById("set-selector")) {
      patch92();
    } else if (document.getElementById("exam-tabs-container")) {
      patch270();
    }
  } catch (err) {
    console.error("Không thể thêm nút xáo câu:", err);
  }
})();
