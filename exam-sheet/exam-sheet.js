(function () {
  "use strict";

  var SHEET_DEFS = [
    { name: "Sheet1", color: "", status: 1, order: 0, hide: 0, row: 84, column: 30, defaultRowHeight: 19, defaultColWidth: 73, celldata: [], config: {} },
    { name: "Sheet2", color: "", status: 0, order: 1, hide: 0, row: 84, column: 30, defaultRowHeight: 19, defaultColWidth: 73, celldata: [], config: {} },
    { name: "Scratch", color: "", status: 0, order: 2, hide: 0, row: 84, column: 30, defaultRowHeight: 19, defaultColWidth: 73, celldata: [], config: {} }
  ];

  var TOOLBAR_BUTTONS = [
    "undo", "redo", "format-painter", "clear-format", "|",
    "currency-format", "percentage-format", "number-decrease", "number-increase", "format", "|",
    "font-size", "|",
    "bold", "italic", "strikethrough", "underline", "font-color", "|",
    "background", "border", "merge-cell", "|",
    "horizontal-align", "vertical-align", "text-wrap", "text-rotation", "|",
    "freeze-row-and-column", "sort-and-filter", "|",
    "function", "formula"
  ];

  function bootSheet() {
    luckysheet.create({
      container: "luckysheet",
      lang: "en",
      title: "FIN368 Exam",
      data: SHEET_DEFS,
      showinfobar: false,
      showtoolbarConfig: { print: false, image: false, link: false, chart: false, postil: false, pivotTable: false, dataVerification: false, splitColumn: false, screenshot: false, protection: false },
      showtoolbar: true,
      showsheetbar: true,
      showstatisticBar: true,
      enableAddRow: true,
      enableAddCol: false,
      sheetFormulaBar: true,
      allowCopy: true,
      allowEdit: true,
      showConfigWindowResize: false,
      cellRightClickConfig: { copy: true, copyAs: true, paste: true, insertRow: true, insertColumn: true, deleteRow: true, deleteColumn: true, deleteCell: true, hideRow: true, hideColumn: true, rowHeight: true, columnWidth: true, clear: true, matrix: false, sort: true, filter: true, chart: false, image: false, link: false, data: false, cellFormat: true },
      hook: {
        workbookCreateAfter: function () {
          installLegacyAliases();
          if (window.location.search.indexOf("selftest") !== -1) runSelfTest();
        }
      }
    });
  }

  function installLegacyAliases() {
    var fns = window.luckysheet_function;
    if (!fns) return;
    var aliases = {
      STDEV: "STDEVA",
      "STDEV.S": "STDEVA",
      "STDEV.P": "STDEVP",
      VAR: "VAR_S",
      "VAR.S": "VAR_S",
      "VAR.P": "VAR_P",
      COVAR: "COVARIANCE_P",
      "COVARIANCE.P": "COVARIANCE_P",
      "COVARIANCE.S": "COVARIANCE_S"
    };
    Object.keys(aliases).forEach(function (legacy) {
      var target = aliases[legacy];
      if (fns[target] && !fns[legacy]) fns[legacy] = fns[target];
    });
  }

  function downloadCSV() {
    if (typeof luckysheet === "undefined" || !luckysheet.getSheetData) {
      alert("Spreadsheet not ready yet.");
      return;
    }
    var data = luckysheet.getSheetData();
    var sheetName = (luckysheet.getSheet() && luckysheet.getSheet().name) || "Sheet";
    var lastRow = -1, lastCol = -1;
    for (var r = 0; r < data.length; r++) {
      var row = data[r] || [];
      for (var c = 0; c < row.length; c++) {
        var cell = row[c];
        if (cell && (cell.v !== undefined && cell.v !== null && cell.v !== "" || cell.m)) {
          if (r > lastRow) lastRow = r;
          if (c > lastCol) lastCol = c;
        }
      }
    }
    var lines = [];
    for (var rr = 0; rr <= lastRow; rr++) {
      var src = data[rr] || [];
      var cells = [];
      for (var cc = 0; cc <= lastCol; cc++) {
        var cell2 = src[cc];
        var raw = "";
        if (cell2) raw = (cell2.m !== undefined && cell2.m !== null) ? cell2.m : (cell2.v !== undefined && cell2.v !== null ? cell2.v : "");
        var s = String(raw);
        if (s.indexOf(",") !== -1 || s.indexOf("\"") !== -1 || s.indexOf("\n") !== -1) s = "\"" + s.replace(/"/g, "\"\"") + "\"";
        cells.push(s);
      }
      lines.push(cells.join(","));
    }
    var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "FIN368-" + sheetName.replace(/[^a-z0-9_-]+/gi, "_") + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function runSelfTest() {
    var fns = window.luckysheet_function;
    if (!fns) return;
    var cases = [
      { label: "SUM", formula: "SUM(1,2,3,4)", expected: 10, run: function () { return fns.SUM.f(1, 2, 3, 4); } },
      { label: "AVERAGE", formula: "AVERAGE(1,2,3,4,5)", expected: 3, run: function () { return fns.AVERAGE.f(1, 2, 3, 4, 5); } },
      { label: "STDEV (alias)", formula: "STDEV(2,4,4,4,5,5,7,9)", expected: 2.13808993529939, run: function () { return fns.STDEV && fns.STDEV.f(2, 4, 4, 4, 5, 5, 7, 9); } },
      { label: "STDEVA", formula: "STDEVA(2,4,4,4,5,5,7,9)", expected: 2.13808993529939, run: function () { return fns.STDEVA.f(2, 4, 4, 4, 5, 5, 7, 9); } },
      { label: "VAR (alias)", formula: "VAR(2,4,4,4,5,5,7,9)", expected: 4.571428571428571, run: function () { return fns.VAR && fns.VAR.f(2, 4, 4, 4, 5, 5, 7, 9); } },
      { label: "CORREL", formula: "CORREL({1,2,3,4,5},{2,4,5,4,5})", expected: 0.7745966692414834, run: function () { return fns.CORREL.f([[1, 2, 3, 4, 5]], [[2, 4, 5, 4, 5]]); } },
      { label: "NPV", formula: "NPV(0.10, -10000, 3000, 4200, 6800)", expected: 1188.4434123352207, run: function () { return fns.NPV.f(0.10, -10000, 3000, 4200, 6800); } },
      { label: "IRR", formula: "IRR({-70000,12000,15000,18000,21000,26000})", expected: 0.0866309480365315, run: function () { return fns.IRR.f([[-70000, 12000, 15000, 18000, 21000, 26000]]); } },
      { label: "PMT", formula: "PMT(0.05/12, 360, -200000)", expected: 1073.6432829017395, run: function () { return fns.PMT.f(0.05 / 12, 360, -200000); } },
      { label: "PV", formula: "PV(0.05, 10, 1000)", expected: -7721.7349101444785, run: function () { return fns.PV.f(0.05, 10, 1000); } },
      { label: "FV", formula: "FV(0.06, 5, -1000, 0)", expected: 5637.092960000001, run: function () { return fns.FV.f(0.06, 5, -1000, 0); } },
      { label: "RATE", formula: "RATE(360, -1073.64, 200000)", expected: 0.00416666, run: function () { return fns.RATE.f(360, -1073.6432829017395, 200000); } },
      { label: "POWER", formula: "POWER(1.05, 10)", expected: 1.6288946267774414, run: function () { return fns.POWER.f(1.05, 10); } }
    ];

    var tbody = document.querySelector("#selftest-table tbody");
    tbody.innerHTML = "";
    cases.forEach(function (tc) {
      var got, ok = false;
      try { got = tc.run(); } catch (e) { got = "ERR: " + e.message; }
      if (typeof got === "number" && typeof tc.expected === "number") {
        ok = Math.abs(got - tc.expected) < Math.max(1e-4, Math.abs(tc.expected) * 1e-4);
      }
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + tc.label + "</td>" +
        "<td class='formula'>=" + tc.formula + "</td>" +
        "<td class='num'>" + (typeof tc.expected === "number" ? tc.expected.toFixed(6) : tc.expected) + "</td>" +
        "<td class='num'>" + (typeof got === "number" ? got.toFixed(6) : got) + "</td>" +
        "<td class='" + (ok ? "ok" : "fail") + "'>" + (ok ? "OK" : "FAIL") + "</td>";
      tbody.appendChild(tr);
    });
    document.getElementById("selftest-panel").hidden = false;
  }

  function init() {
    document.getElementById("btn-csv").addEventListener("click", downloadCSV);
    document.getElementById("btn-print").addEventListener("click", function () { window.print(); });
    document.getElementById("btn-help").addEventListener("click", function () {
      document.getElementById("help-panel").hidden = false;
    });
    document.getElementById("help-close").addEventListener("click", function () {
      document.getElementById("help-panel").hidden = true;
    });
    document.getElementById("selftest-close").addEventListener("click", function () {
      document.getElementById("selftest-panel").hidden = true;
    });
    bootSheet();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
