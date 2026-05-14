// ==UserScript==
// @name         Automatic-operation
// @namespace    https://github.com/sewolonX/Automatic-operation
// @version      5.0.4
// @description  不想描述
// @author       sewolon
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @downloadURL https://sewolon.oss-cn-shanghai.aliyuncs.com/automatic-operation/Automatic-operation.js
// @updateURL https://sewolon.oss-cn-shanghai.aliyuncs.com/automatic-operation/Automatic-operation.js
// ==/UserScript==

(function () {
    'use strict';

    if (!location.protocol.startsWith('http')) return;
    if (!document.body) { console.error('[AUTO_OP] body 跳过:'); return; }

    const IS_TOP = (function () { try { return window.top === window.self; } catch (e) { console.error('[AUTO_OP] IS_TOP 异常:', e); return true; } })();
    if (!IS_TOP) return;

    const IS_MOBILE = (function () {
        try {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
        } catch (e) { console.error('[AUTO_OP] IS_MOBILE 异常:', e); return false; }
    })();

    const STORAGE_KEY = 'AUTO_OP_CONFIG_' + window.location.hostname;
    const REFRESH_STATE_KEY = 'AUTO_OP_REFRESH_STATE_' + window.location.hostname;
    const AUTOSTART_STATE_KEY = 'AUTO_OP_AUTOSTART_' + window.location.hostname;

    const DEBUG = false;
    let targets = [];
    let isRunning = false;
    let timerID = null;
    let clickedCount = 0;
    let maxClicks = Infinity;
    let clickInterval = 1000;
    let isPicking = false;
    let isDarkMode = false;
    let autoFillContent = '';
    let isMultiMode = false;
    let clickStrategy = 'simultaneous';
    let currentQueueIndex = 0;
    let waitStartTime = 0;
    let isWaiting = false;
    let waitTimerID = null;
    let originalFocus = HTMLElement.prototype.focus;
    let focusinHandler = null;
    let wakeLock = null;
    let stateTimerID = null;
    let uiThrottled = false;
    let isAutoRefresh = false;
    let refreshIntervalSec = 60;
    let refreshTimerID = null;
    let refreshStartTimestamp = 0;
    let refreshProgressTimerID = null;
    let refreshLogs = [];
    let currentPage = 0;
    const PAGE_COUNT = 3;
    let collapseAnimPhase = 'collapsed';
    let collapsedWidth = 300;
    let autoStartIntervalMin = 0;
    let autoStartEnabled = false;
    let autoStartTimerID = null;
    let autoStartCountdownTimerID = null;
    let autoStartNextTime = 0;
    let autoStartCountdownLabel = null;
    let maxDurationMin = 0;
    let maxDurationTimerID = null;
    let operationStartTimestamp = 0;
    let elapsedTimerID = null;
    let elapsedSpan = null;

    async function requestWakeLock() {
        try { wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { console.error('[AUTO_OP] WakeLock 异常:', e); }
    }
    async function releaseWakeLock() {
        if (wakeLock) { await wakeLock.release(); wakeLock = null; }
    }
    function suppressFocus() {
        HTMLElement.prototype.focus = function() {
            if (!panel.contains(this)) return;
            originalFocus.apply(this, arguments);
        };
        focusinHandler = function(e) {
            if (!panel.contains(e.target)) e.target.blur();
        };
        document.addEventListener('focusin', focusinHandler, true);
    }
    function restoreFocus() {
        HTMLElement.prototype.focus = originalFocus;
        if (focusinHandler) { document.removeEventListener('focusin', focusinHandler, true); focusinHandler = null; }
    }

    // ========== 注入样式 ==========
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --panel-bg: #18181b;
            --panel-border: #333;
            --panel-text: #e0e0e0;
            --panel-input-bg: #27272a;
            --panel-input-border: #333;
            --panel-input-text: #e0e0e0;
            --panel-label-text: #888;
            --panel-button-bg: rgba(255,255,255,0.06);
            --panel-button-border: rgba(255,255,255,0.1);
            --panel-button-text: #999;
            --panel-button-hover-bg: rgba(255,255,255,0.12);
            --panel-button-hover-text: #fff;
            --panel-highlight-border: #277AF7;
            --panel-active-border: #22c55e;
            --panel-active-text: #22c55e;
            --panel-waiting-text: #f59e0b;
            --panel-highlight: #f59e0b;
            --panel-missing-border: #dc2626;
            --panel-missing-text: #dc2626;
            --auto-op-font: system-ui;
        }
        [data-theme="light"] {
            --panel-bg: #ffffff;
            --panel-border: #e5e7eb;
            --panel-text: #1f2937;
            --panel-input-bg: #f9fafb;
            --panel-input-border: #d1d5db;
            --panel-input-text: #1f2937;
            --panel-label-text: #6b7280;
            --panel-button-bg: rgba(0,0,0,0.05);
            --panel-button-border: rgba(0,0,0,0.1);
            --panel-button-text: #6b7280;
            --panel-button-hover-bg: rgba(0,0,0,0.1);
            --panel-button-hover-text: #1f2937;
            --panel-highlight-border: #3482FF;
            --panel-active-border: #32d486;
            --panel-active-text: #32d486;
            --panel-waiting-text: #d97706;
            --panel-highlight: #d97706;
            --panel-missing-border: #dc2626;
            --panel-missing-text: #dc2626;
            .auto-op-status { border-top-color: #999; }
            .auto-op-switch-thumb { background: #ffffff; }
            .auto-op-switch-track { border-color: #d1d5db; background: #dedede; }
            .auto-op-match-mode { opacity: 0.75 !important; }
            .auto-op-modal-overlay { background: rgba(0,0,0,0.2); }
            .auto-op-log-entry { border-bottom-color: rgba(0,0,0,0.04); }
        }
        #auto-op-panel {
            position: fixed; top: 85px; left: 35px; z-index: 2147483647 !important;
            background: var(--panel-bg); color: var(--panel-text); border: 1px solid var(--panel-border);
            border-radius: 12px; padding: 0; width: 300px; font-size: 13px !important;
            box-shadow: 0 0 6px rgba(0,0,0,0.15);
            transition: opacity 0.3s, width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            display: flex; flex-direction: column; font-variant-numeric: tabular-nums !important;
            text-align: left !important; contain: layout style !important; isolation: isolate !important;
        }
        .auto-op-header {
            position: sticky; top: 0; background: var(--panel-bg); border-bottom: 1px solid var(--panel-border);
            padding: 14px 14px 14px 14px; cursor: move; min-height: 44px; touch-action: none;
            z-index: 1; display: flex; align-items: center; flex-shrink: 0;
        }
        .auto-op-header h3 {
            margin: 0; font-size: 18px; font-weight: 800; font-family: inherit; color: var(--panel-text);
            display: flex; align-items: center; gap: 8px; min-width: 0; overflow: hidden; white-space: nowrap; flex: 1 1 auto; text-align: right; justify-content: flex-end;
        }
        .auto-op-toggle {
            flex-shrink: 0; width: 30px; height: 30px; background: var(--panel-button-bg);
            border: 1px solid var(--panel-button-border); color: var(--panel-button-text);
            font-size: 18px; font-family: var(--auto-op-font); cursor: pointer; display: flex; align-items: center;
            justify-content: center; padding: 0; border-radius: 6px; margin-right: 12px; line-height: 1;
            transition: all 0.3s; -webkit-tap-highlight-color: transparent; user-select: none;
        }
        .auto-op-toggle:hover { background: var(--panel-button-hover-bg); color: var(--panel-button-hover-text); }
        .auto-op-toggle:active { transform: scale(0.85) !important; }
        .auto-op-header-start {
            flex-shrink: 0; width: 30px; height: 30px; border: none; color: #fff;
            font-size: 14px; font-family: inherit; cursor: pointer; display: none;
            align-items: center; justify-content: center; padding: 0; border-radius: 6px; margin-right: 12px;
            line-height: 0; transition: all 0.3s, opacity 0.3s ease; background: #16a34a; opacity: 0.9 !important; text-align: center;
            -webkit-tap-highlight-color: transparent; user-select: none;
        }
        .auto-op-header-start:hover { background: #22c55e; opacity: 1 !important; }
        .auto-op-header-start.is-stop { background: #dc2626; opacity: 0.9 !important; }
        .auto-op-header-start.is-stop:hover { background: #ef4444; opacity: 1 !important; }
        .auto-op-header-start:active { transform: scale(0.85) !important; }
        .auto-op-header-start:disabled { opacity: 0.4 !important; cursor: not-allowed; }
        .auto-op-body {
            padding: 14px 14px 14px; overflow: hidden; max-height: 60vh;
            transition: max-height 0.35s ease, padding 0.25s ease, opacity 0.3s ease; opacity: 1;
        }
        .auto-op-body::-webkit-scrollbar { display: none; }
        #auto-op-panel.collapsing .auto-op-body {
            max-height: 0 !important; padding: 0 !important; margin: 0 !important; border-width: 0 !important;
            opacity: 0; overflow: hidden; contain: layout !important;
            transition: max-height 0.35s ease, padding 0.25s ease, margin 0.25s ease, border-width 0.25s ease, opacity 0.3s ease; visibility 0.25s ease;
        }
        #auto-op-panel.collapsed { gap: 0 !important; }
        #auto-op-panel.collapsed .auto-op-header { justify-content: flex-start; }
        #auto-op-panel.collapsed .auto-op-header h3 { flex: 0 0 auto !important; margin-left: auto; }
        #auto-op-panel.collapsed .auto-op-header-start {
            display: flex; opacity: 0; animation: auto-op-fade-in 0.3s ease 0.1s forwards;
        }
        #auto-op-panel.collapsed .auto-op-body {
            max-height: 0 !important; padding: 0 !important; margin: 0 !important;
            border-width: 0 !important; opacity: 0; overflow: hidden;
            visibility: hidden; contain: layout !important;
			transition: max-height 0.35s ease, padding 0.25s ease, opacity 0.3s ease;
        }
        #auto-op-panel.body-hidden .auto-op-body {
            max-height: 0 !important; padding: 0 !important; margin: 0 !important;
            border-width: 0 !important; opacity: 0; overflow: hidden;
            contain: layout !important;
            transition: max-height 0.35s ease, padding 0.25s ease, opacity 0.3s ease;
        }
        .auto-op-row { margin-bottom: 12px; min-height: 0px; }
        .auto-op-row label {
            display: block; font-size: 11px; font-weight: 600; font-family: var(--auto-op-font); color: var(--panel-label-text);
            margin-bottom: 5px; letter-spacing: 0.5px;
        }
        .auto-op-row input[type="number"], .auto-op-row select, .auto-op-row input[type="text"] {
            width: 100%; background: var(--panel-input-bg) !important; border: 1px solid var(--panel-input-border) !important;
            border-radius: 6px; color: var(--panel-input-text) !important; padding: 7px 10px; font-size: 13px;
            font-family: var(--auto-op-font); font-variant-numeric: tabular-nums; box-sizing: border-box; outline: none; -webkit-appearance: none;
        }
        .auto-op-row input[type="number"]:focus, .auto-op-row select:focus, .auto-op-row input[type="text"]:focus {
            border-color: var(--panel-highlight-border) !important;
        }
        .auto-op-row input[type="number"]:focus-visible, .auto-op-row select:focus-visible, .auto-op-row input[type="text"]:focus-visible {
            border-color: var(--panel-highlight-border) !important;
        }
        .auto-op-row input[type="number"]::placeholder { color: var(--panel-label-text); }
        .auto-op-row select option { background: var(--panel-input-bg); color: var(--panel-input-text); }
        .auto-op-row-switch {
            display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
        }
        .auto-op-row-switch label {
            margin-bottom: 0; flex: 1; font-size: 11px; font-weight: 600; font-family: var(--auto-op-font);
            color: var(--panel-label-text); letter-spacing: 0.5px;
        }
        .auto-op-switch {
            position: relative; width: 36px; height: 20px; flex-shrink: 0;
            flex: 0 0 36px !important; -webkit-tap-highlight-color: transparent;
        }
        .auto-op-switch input {
            opacity: 0; width: 0; height: 0; position: absolute;
            -webkit-tap-highlight-color: transparent;
        }
        .auto-op-switch-track {
            position: absolute; inset: 0; background: #27272a; border: 1px solid var(--panel-input-border);
            border-radius: 10px; cursor: pointer; transition: background 0.3s, border-color 0.3s; display: flex; align-items: center;
        }
        .auto-op-switch-thumb {
            width: 14px; height: 14px; background: #999; border-radius: 50%;
            transition: transform 0.3s, background 0.3s; pointer-events: none; flex-shrink: 0; transform: translateX(3px);
        }
        .auto-op-switch input:checked + .auto-op-switch-track {
            background: var(--panel-highlight-border); border-color: var(--panel-highlight-border);
        }
        .auto-op-switch input:checked + .auto-op-switch-track .auto-op-switch-thumb {
            transform: translateX(18px); background: #fff;
        }
        .auto-op-target-list-container { min-height: 0px; }
        .auto-op-target-info {
            background: var(--panel-input-bg); border: 1px solid var(--panel-input-border);
            border-radius: 6px; padding: 8px 10px; font-size: 12px; font-weight: 600; font-family: var(--auto-op-font);
            color: var(--panel-label-text); word-break: break-all; line-height: 1.5;
        }
        .auto-op-target-list {
            max-height: 350px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; scrollbar-width: none; -ms-overflow-style: none;
        }
        .auto-op-target-list::-webkit-scrollbar { display: none; }
        .auto-op-target-item {
            background: var(--panel-input-bg); border: 1px solid var(--panel-input-border);
            border-radius: 6px; padding: 8px 10px; font-size: 12px; font-family: var(--auto-op-font);
            color: var(--panel-highlight-border); word-break: break-all; line-height: 1.5;
            position: relative; min-height: 54px; max-height: 80px; overflow-y: auto;
            box-sizing: border-box; transition: border-color 0s, color 0s;
            scrollbar-width: none; -ms-overflow-style: none;
        }
        .auto-op-target-item::-webkit-scrollbar { display: none; }
        .auto-op-target-item.active { border-color: var(--panel-active-border); color: var(--panel-active-text); }
        .auto-op-target-item.missing { border-color: var(--panel-missing-border); color: var(--panel-missing-text); }
        .auto-op-target-item span { display: block; padding-right: 20px; white-space: pre-wrap; font-weight: 600; }
        .auto-op-target-parent { display: block; padding-right: 0px !important; font-size: 11px; font-weight: 600; color: var(--panel-highlight-border); margin-bottom: 2px; }
        .auto-op-btn-info {
            display: block; margin-top: 4px; margin-bottom: 2px; width: 16px; height: 16px;
            background: var(--panel-button-bg); border: 1px solid var(--panel-button-border);
            color: var(--panel-button-text); font-size: 10px; font-family: var(--auto-op-font);
            line-height: 14px; text-align: center; border-radius: 4px; cursor: pointer; padding: 0; transition: all 0.3s;
            -webkit-tap-highlight-color: transparent; user-select: none;
        }
        .auto-op-btn-info:hover { background: var(--panel-highlight-border); color: #fff; border-color: var(--panel-highlight-border); }
        .auto-op-btn-info:active { transform: scale(0.85) !important; }
        .auto-op-match-mode {
            position: absolute !important; right: 24px !important; top: 4px !important; width: 42px !important; height: 16px !important;
            font-size: 10px !important; font-weight: 500 !important; font-family: var(--auto-op-font) !important; padding: 0px 4px !important;
            background: var(--panel-button-bg) !important; border: 1px solid var(--panel-button-border)!important;
            color: var(--panel-button-text) !important; border-radius: 4px !important; opacity: 0.8 !important;
        }
        .auto-op-btn-item-del {
            position: absolute; top: 4px; right: 4px; width: 16px; height: 16px;
            background: var(--panel-button-bg); border: 1px solid var(--panel-button-border);
            color: var(--panel-button-text); font-size: 10px; font-family: var(--auto-op-font);
            line-height: 14px; text-align: center; border-radius: 4px; cursor: pointer; padding: 0; transition: all 0.3s;
            -webkit-tap-highlight-color: transparent; user-select: none;
        }
        .auto-op-btn-item-del:hover { background: #dc2626; color: #fff; border-color: #dc2626; }
        .auto-op-btn-item-del:active { transform: scale(0.85) !important; }
        .auto-op-btn-group { display: flex; gap: 8px; margin-top: 14px; }
        .auto-op-btn {
            flex: 1; padding: 9px 0; border: none; border-radius: 6px; font-size: 13px;
            font-weight: 600; font-family: var(--auto-op-font); cursor: pointer; transition: all 0.3s;
            display: flex; align-items: center; justify-content: center;
            -webkit-tap-highlight-color: transparent; user-select: none;
        }
        .auto-op-btn:active { transform: scale(0.96) !important; }
        .auto-op-btn-pick { background: var(--panel-button-bg); color: var(--panel-button-text); }
        .auto-op-btn-pick:hover { background: var(--panel-button-hover-bg); color: var(--panel-button-hover-text); }
        .auto-op-btn-pick.picking { background: #f59e0b; color: #000; animation: auto-op-pulse 1s infinite !important; }
        .auto-op-btn-pick:disabled, .auto-op-btn-start:disabled { opacity: 0.4; cursor: not-allowed; }
        .auto-op-btn-start { background: #16a34a; color: #fff; }
        .auto-op-btn-start:hover { background: #22c55e; }
        .auto-op-btn-stop { background: #dc2626; color: #fff; }
        .auto-op-btn-stop:hover { background: #ef4444; }
        .auto-op-status {
            margin-top: 12px; padding-top: 12px; border-top: 1px solid #888; font-size: 12px; font-weight: 600;
            font-family: var(--auto-op-font); color: var(--panel-label-text); display: flex;
            justify-content: space-between; align-items: center;
        }
        .auto-op-status .auto-op-count { color: var(--panel-highlight-border); font-size: 14px; font-family: var(--auto-op-font); }
        .auto-op-status.running .auto-op-count { animation: auto-op-pulse 0.8s infinite !important; }
        .auto-op-status .auto-op-waiting { color: var(--panel-waiting-text); font-size: 11px; font-family: var(--auto-op-font); }
        .auto-op-status .auto-op-elapsed {
            color: var(--panel-highlight-border); font-size: 11px; font-weight: 700;
            font-family: var(--auto-op-font); font-variant-numeric: tabular-nums; margin-left: 8px;
        }
        .auto-op-highlight { outline: 2px dashed var(--panel-highlight) !important; outline-offset: 1px !important; cursor: crosshair !important; }
        .auto-op-selected-highlight { outline: 2px solid var(--panel-active-border) !important; outline-offset: 1px !important; }
        .auto-op-parent-highlight { box-shadow: 0 0 0 4px var(--panel-highlight-border) !important; outline-offset: -2px !important; position: relative !important; }
        .auto-op-parent-highlight-Overlap { box-shadow: 0 0 0 2px var(--panel-highlight-border) !important; position: relative !important; }
        .auto-op-nearest-parent-highlight { outline: 2px dashed var(--panel-missing-border) !important; outline-offset: -2px !important; position: relative !important; }
        .auto-op-btn-clear {
            flex-shrink: 0; padding: 0px; font-size: 11px; font-family: var(--auto-op-font);
            background: var(--panel-button-bg); border: 1px solid var(--panel-button-border);
            color: var(--panel-button-text); border-radius: 4px; cursor: pointer;
            white-space: nowrap; max-width: 35px; max-height: 16px;
            display: inline-flex; align-items: center; justify-content: center;
            flex: 1; font-weight: 600; transition: all 0.3s;
            -webkit-tap-highlight-color: transparent; user-select: none;
        }
        .auto-op-btn-clear:hover { background: #dc2626; color: #fff; border-color: #dc2626; }
        .auto-op-btn-clear:active { transform: scale(0.85) !important; }
        .auto-op-target-count { font-size: 11px; font-weight: 600; font-family: var(--auto-op-font); margin-left: 6px; display: inline-flex; align-items: center; }
        .auto-op-target-count-exist { color: var(--panel-active-text); }
        .auto-op-target-count-missing { color: var(--panel-missing-text); }
        .auto-op-target-count-total { color: var(--panel-highlight-border); }
        @keyframes auto-op-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        @keyframes auto-op-fade-in {
            from { opacity: 0; }
            to   { opacity: 0.9; }
        }
        .auto-op-modal-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center; z-index: 2147483647;
        }
        .auto-op-modal-box {
            background: var(--panel-bg); border: 1px solid var(--panel-border);
            border-radius: 10px; padding: 20px; min-width: 240px; max-width: 275px;
            max-height: 250px; overflow-y: auto;
            display: flex; flex-direction: column;
        }
        .auto-op-modal-text {
            font-size: 13px; font-weight: 500; font-family: var(--auto-op-font);
            color: var(--panel-text); line-height: 1.6; margin-bottom: 16px;
            word-break: break-all; white-space: pre-wrap; flex: 1 1 auto; overflow-y: auto; min-height: 0;
        }
        .auto-op-modal-btns { display: flex; gap: 8px; flex-shrink: 0; }
        .auto-op-modal-btn {
            flex: 1; padding: 8px 0; border: none; border-radius: 6px;
            font-size: 13px; font-weight: 600; font-family: var(--auto-op-font);
            cursor: pointer; transition: all 0.3s;
            display: flex; align-items: center; justify-content: center;
            -webkit-tap-highlight-color: transparent; user-select: none;
        }
        .auto-op-modal-btn:active { transform: scale(0.96) !important; }
        .auto-op-modal-cancel { background: var(--panel-button-bg); color: var(--panel-button-text); }
        .auto-op-modal-cancel:hover { background: var(--panel-button-hover-bg); color: var(--panel-button-hover-text); }
        .auto-op-modal-ok { background: var(--panel-missing-border); color: #fff; opacity: 0.9 !important; }
        .auto-op-modal-ok:hover { opacity: 1 !important; }
        .auto-op-section-divider {
            margin: 14px 0 10px; padding-top: 12px;
            border-top: 1px solid var(--panel-border);
            font-size: 11px; font-weight: 700; font-family: var(--auto-op-font);
            color: var(--panel-label-text); letter-spacing: 0.5px;
        }
        .auto-op-progress-info {
            display: flex; justify-content: space-between; align-items: center; margin-top: 8px;
            margin-bottom: 6px; font-family: var(--auto-op-font);
        }
        .auto-op-progress-percent {
            color: var(--panel-highlight-border); font-size: 14px; font-weight: 700;
            font-variant-numeric: tabular-nums;
        }
        .auto-op-progress-time {
            color: var(--panel-label-text); font-size: 12px; font-weight: 600;
            font-variant-numeric: tabular-nums;
        }
        .auto-op-progress-container {
            width: 100%; height: 8px;
            background: var(--panel-input-bg); border: 1px solid var(--panel-input-border);
            border-radius: 4px; overflow: hidden; margin-bottom: 12px;
        }
        .auto-op-progress-fill {
            height: 100%; width: 0%; background: var(--panel-highlight-border);
            border-radius: 3px; transition: width 0.3s ease, background-color 0.5s ease;
        }
        .auto-op-log-header {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;
        }
        .auto-op-log-header label {
            margin-bottom: 0; font-size: 11px; font-weight: 600; font-family: var(--auto-op-font);
            color: var(--panel-label-text); letter-spacing: 0.5px;
        }
        .auto-op-log-container {
            background: var(--panel-input-bg); border: 1px solid var(--panel-input-border);
            border-radius: 6px; padding: 8px 10px; max-height: 300px;
            overflow-y: auto; font-size: 11px; font-family: var(--auto-op-font);
            color: var(--panel-label-text); scrollbar-width: none;
        }
        .auto-op-log-container::-webkit-scrollbar { display: none; }
        .auto-op-log-entry {
            padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
            line-height: 1.5; word-break: break-all;
        }
        .auto-op-log-entry:last-child { border-bottom: none; }
        .auto-op-log-time {
            color: var(--panel-highlight-border); font-weight: 700; margin-right: 4px;
        }
        .auto-op-log-msg { color: var(--panel-text); font-weight: 500; }
        .auto-op-log-empty {
            color: var(--panel-label-text); font-style: italic; text-align: center; padding: 6px 0; font-size: 11px;
        }
        .auto-op-page-selector {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0; margin: 0 0 10px; gap: 8px; flex-shrink: 0;
        }
        .auto-op-page-btn {
            width: 30px; height: 30px; border: 1px solid var(--panel-button-border);
            background: var(--panel-button-bg); color: var(--panel-button-text);
            border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 700;
            font-family: var(--auto-op-font); display: flex; align-items: center;
            justify-content: center; padding: 0; transition: all 0.3s;
            -webkit-tap-highlight-color: transparent; user-select: none; flex-shrink: 0;
        }
        .auto-op-page-btn:hover { background: var(--panel-button-hover-bg); color: var(--panel-button-hover-text); }
        .auto-op-page-btn:active { transform: scale(0.85) !important; }
        .auto-op-page-btn-space { flex: 1; min-width: 0; }
        .auto-op-page-container {
            position: relative; width: 100%; overflow: hidden;
            transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auto-op-page {
            display: none; opacity: 0; transition: opacity 0.2s ease;
        }
        .auto-op-page.active { display: block; opacity: 1; }
        .auto-op-row .auto-op-label-with-countdown {
            display: flex; align-items: center; justify-content: space-between;
        }
        .auto-op-row .auto-op-autostart-countdown {
            font-size: 10px; font-weight: 600; font-family: var(--auto-op-font);
            color: var(--panel-waiting-text); white-space: nowrap; flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);

    function detectBrowserTheme() {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        isDarkMode = darkModeMediaQuery.matches;
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        darkModeMediaQuery.addEventListener('change', (e) => {
            isDarkMode = e.matches;
            document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        });
    }

    // ========== 创建面板 ==========
    const panel = document.createElement('div');
    panel.id = 'auto-op-panel';
    panel.innerHTML = `
        <div class="auto-op-header">
            <button class="auto-op-toggle" title="收起/展开">−</button>
            <button class="auto-op-header-start" id="auto-op-btn-header-start" title="开始/停止">▶</button>
            <h3>自动操作 ⚔</h3>
        </div>
        <div class="auto-op-body">
            <div class="auto-op-page-selector">
                <button class="auto-op-page-btn" id="auto-op-page-prev" title="上一页"><</button>
                <div class="auto-op-page-btn-space"></div>
                <button class="auto-op-page-btn" id="auto-op-page-next" title="下一页">></button>
            </div>
            <div class="auto-op-page-container" id="auto-op-page-container">
                <!-- ===== 第1页 ===== -->
                <div class="auto-op-page active" data-page="0">
                    <div class="auto-op-row-switch">
                        <label>多选模式</label>
                        <label class="auto-op-switch">
                            <input type="checkbox" id="auto-op-multi-mode">
                            <span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span>
                        </label>
                    </div>
                    <div class="auto-op-row" id="auto-op-strategy-row" style="display: none">
                        <label>操作策略</label>
                        <select id="auto-op-click-strategy">
                            <option value="simultaneous">同时操作（0ms队列）</option>
                            <option value="sequential">队列操作</option>
                        </select>
                    </div>
                    <div class="auto-op-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <label style="margin-bottom: 0;">目标元素</label>
                        <span id="auto-op-target-count" class="auto-op-target-count"></span>
                        <span style="flex: 1;"></span>
                        <button class="auto-op-btn-clear" id="auto-op-btn-clear-all" style="display: none;">清空</button>
                    </div>
                    <div class="auto-op-row" style="margin-top: 0;">
                        <div class="auto-op-target-list-container" id="auto-op-target-list-container">
                            <div class="auto-op-target-info">未选取，请点击下方按钮选取</div>
                        </div>
                    </div>
                    <div class="auto-op-row" id="auto-op-auto-fill-row" style="display: none;">
                        <label>自动填充内容</label>
                        <input type="text" id="auto-op-auto-fill" placeholder="输入内容（留空为清空）">
                    </div>
                </div>
                <!-- ===== 第2页 ===== -->
                <div class="auto-op-page" data-page="1">
                    <div class="auto-op-row">
                        <label>操作次数</label>
                        <input type="number" id="auto-op-max-clicks" min="0" placeholder="留空为无限">
                    </div>
                    <div class="auto-op-row">
                        <label>操作时间（min）</label>
                        <input type="number" id="auto-op-max-duration" min="0" step="0.0001" placeholder="留空为无限 支持小数">
                    </div>
                    <div class="auto-op-row">
                        <label>操作间隔（ms）</label>
                        <input type="number" id="auto-op-click-interval" min="1" placeholder="1000" value="1000">
                    </div>
                    <div class="auto-op-row">
                        <div class="auto-op-label-with-countdown">
                            <label style="margin-bottom:0;">自动启动间隔（min）</label>
                            <span class="auto-op-autostart-countdown" id="auto-op-autostart-countdown"></span>
                        </div>
                        <input type="number" id="auto-op-autostart-interval" min="0" step="0.0001" placeholder="留空为关闭 支持小数">
                    </div>
                    <div class="auto-op-row">
                        <label>元素消失后</label>
                        <select id="auto-op-missing-action">
                            <option value="wait">等待重试（自动继续）</option>
                            <option value="stop">立即停止</option>
                        </select>
                    </div>
                </div>
                <!-- ===== 第3页 ===== -->
                <div class="auto-op-page" data-page="2">
                    <div class="auto-op-row-switch">
                        <label>自动刷新网页</label>
                        <label class="auto-op-switch">
                            <input type="checkbox" id="auto-op-auto-refresh">
                            <span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span>
                        </label>
                    </div>
                    <div class="auto-op-row" id="auto-op-refresh-interval-row">
                        <label>刷新间隔（s）范围：10 ~ 86400</label>
                        <input type="number" id="auto-op-refresh-interval" min="10" max="86400" placeholder="60" value="60">
                    </div>
                    <div class="auto-op-row">
                        <div class="auto-op-log-header">
                            <label>刷新日志</label>
                            <button class="auto-op-btn-clear" id="auto-op-btn-clear-log">清空</button>
                        </div>
                        <div class="auto-op-log-container" id="auto-op-log-container">
                            <div class="auto-op-log-empty">暂无日志</div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="auto-op-refresh-progress" style="display: none;">
                <div class="auto-op-progress-info">
                    <span class="auto-op-progress-percent" id="auto-op-refresh-percent">0%</span>
                    <span class="auto-op-progress-time" id="auto-op-refresh-time">剩余 --:--</span>
                </div>
                <div class="auto-op-progress-container">
                    <div class="auto-op-progress-fill" id="auto-op-progress-fill"></div>
                </div>
            </div>
            <div class="auto-op-btn-group">
                <button class="auto-op-btn auto-op-btn-pick" id="auto-op-btn-pick">选取元素</button>
                <button class="auto-op-btn auto-op-btn-start" id="auto-op-btn-start" disabled>开始</button>
            </div>
            <div class="auto-op-status" id="auto-op-status">
                <span>已操作：<span class="auto-op-count" id="auto-op-count">0</span>次<span class="auto-op-elapsed" id="auto-op-elapsed">00:00:00</span></span>
                <span id="auto-op-state">请选取目标元素</span>
            </div>
        </div>
        <div id="auto-op-modal" style="display:none;">
            <div class="auto-op-modal-overlay">
                <div class="auto-op-modal-box">
                    <div class="auto-op-modal-text" id="auto-op-modal-text"></div>
                    <div class="auto-op-modal-btns">
                        <button class="auto-op-modal-btn auto-op-modal-cancel" id="auto-op-modal-cancel">取消</button>
                        <button class="auto-op-modal-btn auto-op-modal-ok" id="auto-op-modal-ok">确定</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // DOM 引用
    const targetListContainer = document.getElementById('auto-op-target-list-container');
    const autoFillInput = document.getElementById('auto-op-auto-fill');
    const maxClicksInput = document.getElementById('auto-op-max-clicks');
    const clickIntervalInput = document.getElementById('auto-op-click-interval');
    const missingActionSelect = document.getElementById('auto-op-missing-action');
    const btnPick = document.getElementById('auto-op-btn-pick');
    const btnStart = document.getElementById('auto-op-btn-start');
    const statusDiv = document.getElementById('auto-op-status');
    const countSpan = document.getElementById('auto-op-count');
    const stateSpan = document.getElementById('auto-op-state');
    const toggleBtn = panel.querySelector('.auto-op-toggle');
    const dragHandle = panel.querySelector('.auto-op-header');
    const btnClearAll = document.getElementById('auto-op-btn-clear-all');
    const targetCountSpan = document.getElementById('auto-op-target-count');
    const multiModeCheckbox = document.getElementById('auto-op-multi-mode');
    const strategyRow = document.getElementById('auto-op-strategy-row');
    const strategySelect = document.getElementById('auto-op-click-strategy');
    const btnHeaderStart = document.getElementById('auto-op-btn-header-start');
    const pageContainer = document.getElementById('auto-op-page-container');
    const btnPagePrev = document.getElementById('auto-op-page-prev');
    const btnPageNext = document.getElementById('auto-op-page-next');
    const autoRefreshCheckbox = document.getElementById('auto-op-auto-refresh');
    const refreshIntervalInput = document.getElementById('auto-op-refresh-interval');
    const refreshProgressDiv = document.getElementById('auto-op-refresh-progress');
    const refreshPercentSpan = document.getElementById('auto-op-refresh-percent');
    const refreshTimeSpan = document.getElementById('auto-op-refresh-time');
    const refreshProgressFill = document.getElementById('auto-op-progress-fill');
    const logContainer = document.getElementById('auto-op-log-container');
    const btnClearLog = document.getElementById('auto-op-btn-clear-log');
    const maxDurationInput = document.getElementById('auto-op-max-duration');
    const autoStartIntervalInput = document.getElementById('auto-op-autostart-interval');
    autoStartCountdownLabel = document.getElementById('auto-op-autostart-countdown');
    elapsedSpan = document.getElementById('auto-op-elapsed');

    // ========== 分页逻辑 ==========
    function updatePageHeight() {
        const pages = pageContainer.querySelectorAll('.auto-op-page');
        const el = pages[currentPage];
        if (!el) return;
        const h = el.offsetHeight;
        if (h > 0) { pageContainer.style.height = h + 'px'; }
    }

    function goToPage(page, animated) {
        const clamped = ((page % PAGE_COUNT) + PAGE_COUNT) % PAGE_COUNT;
        if (clamped === currentPage && animated !== false) return;
        const pages = pageContainer.querySelectorAll('.auto-op-page');
        const oldPage = pages[currentPage];
        const newPage = pages[clamped];
        currentPage = clamped;
        if (animated === false) {
            pages.forEach(p => { p.classList.remove('active'); p.style.opacity = '0'; });
            newPage.classList.add('active');
            newPage.style.opacity = '1';
        } else {
            oldPage.classList.remove('active');
            oldPage.style.opacity = '0';
            newPage.classList.add('active');
            newPage.style.opacity = '0';
            newPage.offsetHeight;
            newPage.style.opacity = '1';
        }
        updatePageHeight();
        saveData();
    }

    btnPagePrev.addEventListener('click', (e) => { e.stopPropagation(); goToPage(currentPage - 1); });
    btnPageNext.addEventListener('click', (e) => { e.stopPropagation(); goToPage(currentPage + 1); });

    function measureCollapsedWidth() {
        const h3 = dragHandle.querySelector('h3');
        const wasCollapsed = panel.classList.contains('collapsed');
        if (!wasCollapsed) { panel.classList.add('collapsed'); }
        const savedWidth = panel.style.width;
        const savedTransition = panel.style.transition;
        panel.style.transition = 'none';
        panel.style.width = '300px';
        void panel.offsetWidth;
        collapsedWidth = 14 + 30 + 12 + 30 + 12 + h3.offsetWidth + 14 + 2;
        panel.style.width = savedWidth;
        panel.style.transition = savedTransition;
        if (!wasCollapsed) panel.classList.remove('collapsed');
    }

    function performCollapse() {
        const body = panel.querySelector('.auto-op-body');
        collapseAnimPhase = 'collapsing';
        body.style.overflow = 'hidden';
        toggleBtn.textContent = '+';
        panel.classList.add('body-hidden');
        setTimeout(() => {
            panel.classList.remove('body-hidden');
            panel.classList.add('collapsed');
            const h3El = dragHandle.querySelector('h3');
            const h3Width = h3El.scrollWidth;
            collapsedWidth = 14 + 30 + 12 + 30 + 12 + h3Width + 14 + 2;
            panel.style.width = '300px';
            void panel.offsetWidth;
            panel.style.width = collapsedWidth + 'px';
            collapseAnimPhase = 'collapsed';
        }, 200);
    }

    function performExpand() {
        const body = panel.querySelector('.auto-op-body');
        collapseAnimPhase = 'expanding';
        panel.style.width = collapsedWidth + 'px';
        void panel.offsetWidth;
        panel.style.width = '300px';
        setTimeout(() => {
            panel.classList.remove('collapsed');
            panel.style.width = '';
            toggleBtn.textContent = '−';
            setTimeout(() => {
                body.style.overflow = 'auto';
                collapseAnimPhase = 'expanded';
            }, 150);
        }, 200);
    }

    function showConfirm(text) {
        return new Promise(resolve => {
            const modal = document.getElementById('auto-op-modal');
            const modalText = document.getElementById('auto-op-modal-text');
            const btnOk = document.getElementById('auto-op-modal-ok');
            const btnCancel = document.getElementById('auto-op-modal-cancel');
            const overlay = modal.querySelector('.auto-op-modal-overlay');
            const box = modal.querySelector('.auto-op-modal-box');
            modalText.textContent = text;
            modal.style.display = 'block';
            function cleanup() { modal.style.display = 'none'; btnOk.removeEventListener('click', onOk); btnCancel.removeEventListener('click', onCancel); overlay.removeEventListener('click', onOverlay); }
            function onOk() { cleanup(); resolve(true); }
            function onCancel() { cleanup(); resolve(false); }
            function onOverlay() { cleanup(); resolve(false); }
            box.addEventListener('click', (e) => e.stopPropagation());
            btnOk.addEventListener('click', onOk);
            btnCancel.addEventListener('click', onCancel);
            overlay.addEventListener('click', onOverlay);
        });
    }

    detectBrowserTheme();

    panel.classList.add('collapsed');
    toggleBtn.textContent = '+';
    if (window.innerWidth < 500) {
        panel.style.left = Math.max(10, (window.innerWidth - 300) / 2) + 'px';
        panel.style.top = '10px';
        panel.style.right = 'auto';
    }

    // ========== 元素查找与指纹工具 ==========
    function buildBaseSelector(el) {
        if (el.id) return '#' + CSS.escape(el.id);
        let sel = el.tagName.toLowerCase();
        if (el.className && typeof el.className === 'string') {
            const cls = el.className.trim().split(/\s+/).filter(c => c && !c.startsWith('auto-op-')).map(c => '.' + CSS.escape(c)).join('');
            if (cls) sel += cls;
        }
        return sel;
    }
    function buildSelectors(el) {
        const base = buildBaseSelector(el);
        if (el.id) return { strict: base, loose: base };
        let strict = base;
        const parent = el.parentElement;
        if (parent) {
            try {
                const sameTagSiblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
                if (sameTagSiblings.length > 1) strict += ':nth-of-type(' + (sameTagSiblings.indexOf(el) + 1) + ')';
            } catch (e) { console.error('[AUTO_OP] buildSelectors 异常:', e); }
        }
        return { strict: strict, loose: base };
    }
    function isInputField(el) {
        if (!el) return false;
        if (el.isContentEditable) return true;
        if (el.tagName === 'TEXTAREA') return true;
        if (el.tagName === 'INPUT') {
            const t = (el.type || '').toLowerCase();
            return t !== 'checkbox' && t !== 'radio' && t !== 'hidden' && t !== 'file' && t !== 'color' && t !== 'submit' && t !== 'button' && t !== 'reset' && t !== 'image';
        }
        return false;
    }
    function getElText(el) {
        let text = (el.textContent || '').trim();
        if (!text) {
            const visualAttrs = ['alt', 'title', 'placeholder', 'aria-label', 'value'];
            for (const attr of visualAttrs) { const val = el.getAttribute(attr); if (val && val.trim() && val.trim().length < 50) { text = val.trim(); break; } }
        }
        if (!text && el.children.length > 0) {
            for (const child of el.children) {
                const cText = (child.textContent || '').trim();
                if (cText) { text = cText; break; }
                for (const attr of ['alt', 'title']) { const val = child.getAttribute(attr); if (val && val.trim()) { text = val.trim(); break; } }
                if (text) break;
            }
        }
        if (!text) {
            try {
                const pseudoElems = ['::before', '::after'];
                for (const pseudo of pseudoElems) {
                    const style = window.getComputedStyle(el, pseudo);
                    let content = style.getPropertyValue('content');
                    if (content && content !== 'none' && content !== 'normal' && content !== '""') {
                        content = content.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
                        if (content && !(content.length <= 2 && /[\uE000-\uF8FF]/.test(content))) { text = content; break; }
                    }
                }
            } catch(e) { console.error('[AUTO_OP] getElText 异常:', e); }
        }
        return text;
    }
    function getElementFingerprint(el) {
        const dataAttrs = {}, attrs = {};
        const keyAttrs = ['href', 'src', 'value', 'type', 'name', 'role', 'alt', 'title', 'placeholder', 'action', 'method', 'onclick'];
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) dataAttrs[attr.name] = attr.value;
            else if (keyAttrs.includes(attr.name)) attrs[attr.name] = attr.value;
        });
        let onclickParam = '';
        if (attrs.onclick) { const match = attrs.onclick.match(/useItem\((\d+)\)/); if (match) onclickParam = match[1]; }
        let text = getElText(el);
        if (!text && isInputField(el) && el.value != null && String(el.value).trim()) { text = String(el.value).trim(); }
        return { tagName: el.tagName.toLowerCase(), text: text, dataAttrs, attrs, onclickParam, hasStrong: !!el.id || Object.keys(dataAttrs).length > 0 || keyAttrs.some(k => attrs[k]) };
    }
    function matchesFingerprint(el, fp, matchMode) {
        if (!el || el.tagName.toLowerCase() !== fp.tagName) return false;
        if (matchMode === 'strict') {
            for (const [k, v] of Object.entries(fp.dataAttrs)) { if (el.getAttribute(k) !== v) return false; }
            for (const [k, v] of Object.entries(fp.attrs)) { if (v && el.getAttribute(k) !== v) return false; }
            if (fp.onclickParam) { const m = (el.getAttribute('onclick') || '').match(/useItem\((\d+)\)/); if (m && m[1] !== fp.onclickParam) return false; }
            if (fp.text) {
                let elText;
                if (fp.hasStrong) {
                    elText = (el.textContent || '').trim();
                    if (!elText) { const visualAttrs = ['alt', 'title', 'placeholder', 'aria-label', 'value']; for (const attr of visualAttrs) { const val = el.getAttribute(attr); if (val && val.trim()) { elText = val.trim(); break; } } }
                    if (!elText && isInputField(el) && el.value != null && String(el.value).trim()) { elText = String(el.value).trim(); }
                } else { elText = getElText(el); }
                if (elText !== fp.text) return false;
            }
            return true;
        } else {
            if (fp.text) {
                let elText = (el.textContent || '').trim();
                if (!elText) { const visualAttrs = ['alt', 'title', 'placeholder', 'aria-label', 'value']; for (const attr of visualAttrs) { const val = el.getAttribute(attr); if (val && val.trim()) { elText = val.trim(); break; } } }
                if (!elText && isInputField(el) && el.value != null && String(el.value).trim()) { elText = String(el.value).trim(); }
                if (!elText) elText = getElText(el);
                if (elText !== fp.text) return false;
            } else { if (!isInputField(el)) return false; }
        }
        return true;
    }
    let _queryCache = null;
    function beginQueryCycle() { _queryCache = new Map(); }
    function cachedQuery(root, selector) {
        if (!_queryCache) _queryCache = new Map();
        const key = (root === document ? '_doc' : root) + '|' + selector;
        if (_queryCache.has(key)) return _queryCache.get(key);
        const result = Array.from(root.querySelectorAll(selector));
        _queryCache.set(key, result);
        return result;
    }
    function tryFindTarget(targetObj) {
        if (!targetObj || !targetObj.fingerprint) return null;
        const fp = targetObj.fingerprint;
        function verifyList(list) {
            const matched = [];
            for (const el of list) { if (panel.contains(el)) continue; if (matchesFingerprint(el, fp, targetObj.matchMode)) matched.push(el); }
            return matched.length > 0 ? matched : null;
        }
        let root = document;
        if (targetObj.parentSelector) { try { const p = document.querySelector(targetObj.parentSelector); if (p) root = p; } catch (e) { console.error('[AUTO_OP] tryFindTarget parentSelector 异常:', e); } }
        try {
            if (targetObj.strict) { const found = verifyList(cachedQuery(root, targetObj.strict)); if (found) return found; }
            if (targetObj.loose) { const found = verifyList(cachedQuery(root, targetObj.loose)); if (found) return found; }
            const found = verifyList(cachedQuery(root, fp.tagName));
            if (found) return found;
        } catch (e) { console.error('[AUTO_OP] tryFindTarget 查找 异常:', e); }
        if (root !== document) {
            try {
                if (targetObj.strict) { const found = verifyList(cachedQuery(document, targetObj.strict)); if (found) return found; }
                if (targetObj.loose) { const found = verifyList(cachedQuery(document, targetObj.loose)); if (found) return found; }
            } catch (e) { console.error('[AUTO_OP] tryFindTarget fallback 异常:', e); }
        }
        return null;
    }

    // ========== 祖先遍历工具 ==========
    function resolveParentInfo(el) {
        const result = { nearestParent: el.parentElement, blueParent: null };
        let ancestor = el.parentElement;
        while (ancestor && ancestor !== document.body) {
            const s = buildBaseSelector(ancestor);
            if (s !== ancestor.tagName.toLowerCase()) { result.blueParent = ancestor; break; }
            ancestor = ancestor.parentElement;
        }
        return result;
    }

    // ========== 父级高亮 ==========
    function refreshParentHighlights() {
        const newBlueMap = new Map();
        const newNearestMap = new Map();
        for (const t of targets) {
            if (!t.element || !document.contains(t.element)) continue;
            let blue = t.blueParent;
            if (blue && document.contains(blue) && !panel.contains(blue)) { if (!newBlueMap.has(blue)) newBlueMap.set(blue, []); newBlueMap.get(blue).push(t.element); }
            let nearest = t.nearestParent;
            if (!nearest) nearest = t.element.parentElement;
            if (nearest && document.contains(nearest) && !panel.contains(nearest)) { if (!newNearestMap.has(nearest)) newNearestMap.set(nearest, []); newNearestMap.get(nearest).push(t.element); }
        }
        for (const t of targets) {
            if (t._blueParent && !newBlueMap.has(t._blueParent)) { t._blueParent.classList.remove('auto-op-parent-highlight'); t._blueParent.classList.remove('auto-op-parent-highlight-Overlap'); t._blueParent = null; }
            if (t._nearestEl && !newNearestMap.has(t._nearestEl)) { t._nearestEl.classList.remove('auto-op-nearest-parent-highlight'); t._nearestEl = null; }
        }
        for (const [parent, children] of newBlueMap) {
            const isOverlap = newNearestMap.has(parent);
            if (isOverlap) { parent.classList.remove('auto-op-parent-highlight'); parent.classList.add('auto-op-parent-highlight-Overlap'); }
            else { parent.classList.remove('auto-op-parent-highlight-Overlap'); parent.classList.add('auto-op-parent-highlight'); }
            for (const child of children) { const t = targets.find(tt => tt.element === child); if (t) t._blueParent = parent; }
        }
        for (const [parent, children] of newNearestMap) {
            if (newBlueMap.has(parent)) continue;
            if (!parent.classList.contains('auto-op-nearest-parent-highlight')) parent.classList.add('auto-op-nearest-parent-highlight');
            for (const child of children) { const t = targets.find(tt => tt.element === child); if (t) t._nearestEl = parent; }
        }
    }

    // ========== 运行时发现新匹配元素 ==========
    const discoveredElements = new Set();
    function discoverNewTargets() {
        if (targets.length === 0) return;
        if (!targets.some(t => t.matchMode === 'loose')) return;
        const existingElements = new Set();
        for (const t of targets) { if (t.element) existingElements.add(t.element); }
        for (const el of discoveredElements) { if (!document.contains(el)) discoveredElements.delete(el); }
        const newTargets = [];
        const seenKeys = new Set();
        for (const t of targets) {
            if (t.matchMode !== 'loose') continue;
            if (!t.parentSelector) continue;
            const selector = t.loose || t.strict;
            const seenKey = selector + '|' + t.parentSelector;
            if (seenKeys.has(seenKey)) continue;
            seenKeys.add(seenKey);
            let parent; try { parent = document.querySelector(t.parentSelector); } catch (e) { console.error('[AUTO_OP] discoverNewTargets 异常:', e); }
            let candidates;
            if (parent) {
                try { candidates = parent.querySelectorAll(selector); } catch (e) { console.error('[AUTO_OP] discoverNewTargets 异常:', e); candidates = []; }
                if (!candidates || candidates.length === 0) { try { candidates = parent.querySelectorAll(t.fingerprint.tagName); } catch (e) { console.error('[AUTO_OP] discoverNewTargets 异常:', e); candidates = []; } }
            } else { continue; }
            for (const el of candidates) {
                if (panel.contains(el)) continue;
                if (existingElements.has(el)) continue;
                if (discoveredElements.has(el)) continue;
                if (!matchesFingerprint(el, t.fingerprint, t.matchMode)) continue;
                discoveredElements.add(el);
                el.classList.add('auto-op-selected-highlight');
                newTargets.push({ element: el, strict: t.strict, loose: t.loose, fingerprint: t.fingerprint, desc: t.desc, isInput: t.isInput, matchMode: t.matchMode, parentSelector: t.parentSelector, parentChain: t.parentChain, isAuto: true, missCount: 0 });
            }
        }
        if (newTargets.length > 0) targets.push(...newTargets);
    }

    // ========== 自动刷新函数 ==========
    function formatRefreshTime(ms) {
        const totalSec = Math.max(0, Math.ceil(ms / 1000));
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = (n) => String(n).padStart(2, '0');
        return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    }
    function addRefreshLog(msg) {
        const stamp = new Date().toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        refreshLogs.push({ time: stamp, msg: msg || '页面已刷新' });
        updateLogUI();
    }
    function updateLogUI() {
        if (refreshLogs.length === 0) { logContainer.innerHTML = '<div class="auto-op-log-empty">暂无日志</div>'; return; }
        let html = '';
        for (let i = 0; i < refreshLogs.length; i++) {
            html += '<div class="auto-op-log-entry"><span class="auto-op-log-time">' + refreshLogs[i].time + '</span><span class="auto-op-log-msg">' + refreshLogs[i].msg + '</span></div>';
        }
        logContainer.innerHTML = html;
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    function saveRefreshState() {
        try {
            const now = Date.now();
            const totalMs = refreshIntervalSec * 1000;
            const elapsed = now - refreshStartTimestamp;
            const remaining = Math.max(0, totalMs - elapsed);
            const state = {
                active: isAutoRefresh,
                interval: refreshIntervalSec,
                nextRefreshTime: now + remaining,
                wasRunning: isRunning,
                operationStartTimestamp: isRunning ? operationStartTimestamp : 0,
                logs: refreshLogs
            };
            localStorage.setItem(REFRESH_STATE_KEY, JSON.stringify(state));
        } catch (e) { console.error('[AUTO_OP] saveRefreshState 异常:', e); }
    }
    function loadRefreshState() {
        try { const saved = localStorage.getItem(REFRESH_STATE_KEY); if (!saved) return null; return JSON.parse(saved); }
        catch (e) { console.error('[AUTO_OP] loadRefreshState 异常:', e); return null; }
    }
    function clearRefreshState() { try { localStorage.removeItem(REFRESH_STATE_KEY); } catch (e) {} }
    function updateRefreshProgressUI() {
        if (!isAutoRefresh || !refreshStartTimestamp) return;
        const now = Date.now();
        const totalMs = refreshIntervalSec * 1000;
        const elapsed = now - refreshStartTimestamp;
        const remaining = Math.max(0, totalMs - elapsed);
        const percent = Math.min(100, Math.max(0, (elapsed / totalMs) * 100));
        refreshPercentSpan.textContent = percent.toFixed(1) + '%';
        refreshTimeSpan.textContent = '剩余 ' + formatRefreshTime(remaining);
        refreshProgressFill.style.width = percent.toFixed(2) + '%';
        if (remaining < 30000) { refreshProgressFill.style.background = 'var(--panel-missing-border)'; refreshPercentSpan.style.color = 'var(--panel-missing-border)'; }
        else { refreshProgressFill.style.background = 'var(--panel-highlight-border)'; refreshPercentSpan.style.color = 'var(--panel-highlight-border)'; }
        if (remaining <= 0) triggerRefresh();
    }
    function triggerRefresh() {
        addRefreshLog('页面已刷新 (' + (isRunning ? '运行中' : '未运行') + ')');
        saveRefreshState();
        saveData();
        saveAutoStartState();
        if (refreshProgressTimerID) { clearInterval(refreshProgressTimerID); refreshProgressTimerID = null; }
        if (refreshTimerID) { clearTimeout(refreshTimerID); refreshTimerID = null; }
        if (timerID) { clearInterval(timerID); timerID = null; }
        location.reload();
    }
    function startAutoRefreshCountdown(initial) {
        isAutoRefresh = true;
        autoRefreshCheckbox.checked = true;
        refreshProgressDiv.style.display = 'block';
        if (initial) refreshStartTimestamp = Date.now();
        if (refreshProgressTimerID) clearInterval(refreshProgressTimerID);
        refreshProgressTimerID = setInterval(updateRefreshProgressUI, 100);
        const totalMs = refreshIntervalSec * 1000;
        const elapsed = Date.now() - refreshStartTimestamp;
        const remaining = Math.max(0, totalMs - elapsed);
        if (refreshTimerID) clearTimeout(refreshTimerID);
        refreshTimerID = setTimeout(triggerRefresh, remaining + 50);
        updateRefreshProgressUI();
        requestWakeLock();
    }
    function stopAutoRefreshCountdown() {
        isAutoRefresh = false;
        if (refreshProgressTimerID) { clearInterval(refreshProgressTimerID); refreshProgressTimerID = null; }
        if (refreshTimerID) { clearTimeout(refreshTimerID); refreshTimerID = null; }
        refreshProgressDiv.style.display = 'none';
        refreshProgressFill.style.width = '0%';
        refreshPercentSpan.textContent = '0%';
        refreshTimeSpan.textContent = '剩余 --:--';
        clearRefreshState();
        if (!isRunning) releaseWakeLock();
    }

    // ========== 自动启动状态持久化 ==========
    function saveAutoStartState() {
        try {
            if (!autoStartEnabled || autoStartIntervalMin <= 0) {
                localStorage.removeItem(AUTOSTART_STATE_KEY);
                return;
            }
            const state = {
                intervalMin: autoStartIntervalMin,
                enabled: true,
                nextStart: autoStartNextTime
            };
            localStorage.setItem(AUTOSTART_STATE_KEY, JSON.stringify(state));
        } catch (e) { console.error('[AUTO_OP] saveAutoStartState 异常:', e); }
    }
    function loadAutoStartState() {
        try { const saved = localStorage.getItem(AUTOSTART_STATE_KEY); if (!saved) return null; return JSON.parse(saved); }
        catch (e) { console.error('[AUTO_OP] loadAutoStartState 异常:', e); return null; }
    }
    function clearAutoStartState() { try { localStorage.removeItem(AUTOSTART_STATE_KEY); } catch (e) {} }

    // ========== 自动启动时间间隔功能 ==========
    function formatAutoStartCountdown(ms) {
        const totalSec = Math.max(0, Math.ceil(ms / 1000));
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = (n) => String(n).padStart(2, '0');
        if (h > 0) return h + 'h' + pad(m) + 'm' + pad(s) + 's';
        return pad(m) + 'm' + pad(s) + 's';
    }

    function updateAutoStartCountdownUI() {
        if (!autoStartEnabled || autoStartIntervalMin <= 0 || !autoStartNextTime) {
            if (autoStartCountdownLabel) autoStartCountdownLabel.textContent = '';
            return;
        }
        const now = Date.now();
        const remaining = autoStartNextTime - now;
        if (remaining <= 0) {
            if (autoStartCountdownLabel) autoStartCountdownLabel.textContent = '即将启动...';
        } else {
            if (autoStartCountdownLabel) autoStartCountdownLabel.textContent = '距下次启动 ' + formatAutoStartCountdown(remaining);
        }
    }

    function doAutoStart() {
        if (isRunning) return;
        if (targets.length === 0) {
            autoStartNextTime = Date.now() + autoStartIntervalMin * 60 * 1000;
            saveAutoStartState();
            startAutoStartCountdownTimer();
            return;
        }
        startClicking();
        // 保存下一次启动时间
        autoStartNextTime = Date.now() + autoStartIntervalMin * 60 * 1000;
        saveAutoStartState();
        // 操作结束后会重新启动倒计时（在stopClicking中处理）
    }

    function startAutoStartCountdownTimer() {
        if (autoStartCountdownTimerID) { clearInterval(autoStartCountdownTimerID); autoStartCountdownTimerID = null; }
        if (!autoStartEnabled || autoStartIntervalMin <= 0 || !autoStartNextTime) {
            updateAutoStartCountdownUI();
            return;
        }
        autoStartCountdownTimerID = setInterval(() => {
            const now = Date.now();
            const remaining = autoStartNextTime - now;
            updateAutoStartCountdownUI();
            if (remaining <= 0) {
                clearInterval(autoStartCountdownTimerID);
                autoStartCountdownTimerID = null;
                if (autoStartCountdownLabel) autoStartCountdownLabel.textContent = '即将启动...';
                doAutoStart();
            }
        }, 500);
        updateAutoStartCountdownUI();
    }

    function stopAutoStartCountdownTimer() {
        if (autoStartCountdownTimerID) { clearInterval(autoStartCountdownTimerID); autoStartCountdownTimerID = null; }
        autoStartNextTime = 0;
        clearAutoStartState();
        if (autoStartCountdownLabel) autoStartCountdownLabel.textContent = '';
    }

    function setupAutoStartFromInput() {
        const val = parseFloat(autoStartIntervalInput.value);
        if (isNaN(val) || val <= 0) {
            autoStartEnabled = false;
            autoStartIntervalMin = 0;
            stopAutoStartCountdownTimer();
            autoStartIntervalInput.value = '';
        } else {
            autoStartEnabled = true;
            autoStartIntervalMin = val;
            if (!isRunning) {
                autoStartNextTime = Date.now() + autoStartIntervalMin * 60 * 1000;
                saveAutoStartState();
                startAutoStartCountdownTimer();
            }
        }
        saveData();
    }

    // ========== 已操作时间 ==========
    function formatElapsedTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = (n) => String(n).padStart(2, '0');
        return pad(h) + ':' + pad(m) + ':' + pad(s);
    }

    function startElapsedTimer(savedTimestamp) {
        if (elapsedTimerID) clearInterval(elapsedTimerID);
        operationStartTimestamp = savedTimestamp || Date.now();
        // 立即更新一次显示
        if (elapsedSpan) {
            const initElapsed = Date.now() - operationStartTimestamp;
            elapsedSpan.textContent = formatElapsedTime(initElapsed);
        }
        elapsedTimerID = setInterval(() => {
            if (!isRunning || !operationStartTimestamp) return;
            const elapsed = Date.now() - operationStartTimestamp;
            if (elapsedSpan) elapsedSpan.textContent = formatElapsedTime(elapsed);
        }, 1000);
    }
    function stopElapsedTimer() {
        if (elapsedTimerID) { clearInterval(elapsedTimerID); elapsedTimerID = null; }
        // 保留最终时间，不重置
    }
    function resetElapsedDisplay() {
        if (elapsedSpan) elapsedSpan.textContent = '00:00:00';
    }

    // ========== 持久化函数 ==========
    function saveData() {
        const toSave = {
            isMultiMode, clickStrategy,
            clickInterval: parseInt(clickIntervalInput.value) || 1000,
            maxClicks: maxClicksInput.value,
            missingAction: missingActionSelect.value,
            autoFillContent: autoFillInput.value,
            isAutoRefresh, refreshIntervalSec, refreshLogs, currentPage,
            autoStartIntervalMin: autoStartIntervalInput.value || '',
            maxDurationMin: maxDurationInput.value || '',
            targets: targets.map(t => ({
                strict: t.strict, loose: t.loose, fingerprint: t.fingerprint,
                desc: t.desc, isInput: t.isInput, matchMode: t.matchMode, parentSelector: t.parentSelector, parentChain: t.parentChain || [],
                isAuto: !!t.isAuto
            }))
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }

    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        try {
            const cfg = JSON.parse(saved);
            isMultiMode = cfg.isMultiMode || false;
            multiModeCheckbox.checked = isMultiMode;
            strategyRow.style.display = isMultiMode ? 'block' : 'none';
            clickStrategy = cfg.clickStrategy || 'simultaneous';
            strategySelect.value = clickStrategy;
            clickInterval = cfg.clickInterval || 1000;
            clickIntervalInput.value = clickInterval;
            maxClicksInput.value = cfg.maxClicks || '';
            missingActionSelect.value = cfg.missingAction || 'wait';
            autoFillContent = cfg.autoFillContent || '';
            autoFillInput.value = autoFillContent;

            // 自动启动时间间隔
            if (cfg.autoStartIntervalMin !== undefined && cfg.autoStartIntervalMin !== '') {
                autoStartIntervalInput.value = cfg.autoStartIntervalMin;
                const val = parseFloat(cfg.autoStartIntervalMin);
                if (!isNaN(val) && val > 0) {
                    autoStartEnabled = true;
                    autoStartIntervalMin = val;
                }
            }

            // 操作最长时间
            if (cfg.maxDurationMin !== undefined && cfg.maxDurationMin !== '') {
                maxDurationInput.value = cfg.maxDurationMin;
                const val = parseFloat(cfg.maxDurationMin);
                if (!isNaN(val) && val > 0) maxDurationMin = val;
            }

            if (cfg.isAutoRefresh !== undefined) { isAutoRefresh = cfg.isAutoRefresh; autoRefreshCheckbox.checked = isAutoRefresh; }
            if (cfg.refreshIntervalSec !== undefined) { refreshIntervalSec = cfg.refreshIntervalSec; refreshIntervalInput.value = refreshIntervalSec; }
            if (cfg.refreshLogs && Array.isArray(cfg.refreshLogs)) {
                refreshLogs = cfg.refreshLogs.map(item => { if (typeof item === 'string') return { time: item, msg: '页面已刷新' }; return item; });
                updateLogUI();
            }

            targets = [];
            (cfg.targets || []).forEach(t => {
                const base = {
                    strict: t.strict, loose: t.loose, fingerprint: t.fingerprint,
                    desc: t.desc, isInput: !!t.isInput, matchMode: t.matchMode || 'strict',
                    parentSelector: t.parentSelector || '', parentChain: t.parentChain || [],
                    isAuto: !!t.isAuto, missCount: 0, nearestParent: null, blueParent: null, _blueParent: null, _nearestEl: null
                };
                const found = tryFindTarget({ ...base, element: null });
                if (found && found.length > 0) {
                    found.forEach(el => {
                        const obj = { ...base, element: el };
                        const parentInfo = resolveParentInfo(el);
                        obj.nearestParent = parentInfo.nearestParent;
                        obj.blueParent = parentInfo.blueParent;
                        el.classList.add('auto-op-selected-highlight');
                        targets.push(obj);
                        discoveredElements.add(el);
                    });
                } else { targets.push({ ...base, element: null }); }
            });
            targets.forEach(t => { t._isValid = !!t.element && document.contains(t.element) && matchesFingerprint(t.element, t.fingerprint, t.matchMode); });
            updateTargetUI();
            updateTargetCount();
            updateAutoFillVisibility();
            refreshParentHighlights();
            if (typeof cfg.currentPage === 'number') currentPage = cfg.currentPage;
            if (targets.length > 0) stateSpan.textContent = '就绪';
        } catch (e) { console.error('[AUTO_OP] loadData 异常:', e); }
    }

    // ========== UI 更新 ==========
    function updateTargetUI() {
        if (targets.length === 0) {
            targetListContainer.innerHTML = '<div class="auto-op-target-info">未选取，请点击下方按钮选取</div>';
            btnClearAll.style.display = 'none';
            btnStart.disabled = true;
            btnHeaderStart.disabled = true;
            return;
        }
        btnClearAll.style.display = 'inline-block';
        btnStart.disabled = false;
        btnHeaderStart.disabled = false;
        const list = targetListContainer.querySelector('.auto-op-target-list');
        const existingCount = list ? list.querySelectorAll('.auto-op-target-item').length : 0;
        if (existingCount === targets.length && list) return;
        let html = '';
        targets.forEach((t, i) => {
            const isValid = t._isValid !== undefined ? t._isValid : (t.element && document.contains(t.element));
            html += `<div class="auto-op-target-item ${isValid ? 'active' : 'missing'}" data-index="${i}">
                <span>${isMultiMode ? (i + 1) + '. ' : ''}${t.desc}</span>
                <button class="auto-op-btn-info" onclick="window._autoopShowInfo(${i})" title="查看详情">ⓘ</button>
                ${t.parentChain ? t.parentChain.map(p => '<span class="auto-op-target-parent">└> ' + p.desc + '</span>').join('') : ''}
                <select class="auto-op-match-mode" data-index="${i}">
                    <option value="strict" ${t.matchMode === 'strict' ? 'selected' : ''}>严格</option>
                    <option value="loose" ${t.matchMode === 'loose' ? 'selected' : ''}>宽松</option>
                </select>
                <button class="auto-op-btn-item-del" onclick="window._autoopRemoveTarget(${i})">✕</button>
            </div>`;
        });
        targetListContainer.innerHTML = '<div class="auto-op-target-list">' + html + '</div>';
        document.querySelectorAll('.auto-op-match-mode').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (targets[index]) { targets[index].matchMode = e.target.value; saveData(); }
            });
        });
        updateTargetCount();
    }

    function updateAutoFillVisibility() {
        const autoFillRow = document.getElementById('auto-op-auto-fill-row');
        if (!autoFillRow) return;
        autoFillRow.style.display = targets.some(t => t.isInput) ? 'block' : 'none';
    }

    function updateTargetCount(status) {
        if (!status) {
            let existCount = 0, missingCount = 0, total = targets.length;
            for (let i = 0; i < total; i++) { const t = targets[i]; if (t.element && document.contains(t.element) && t._isValid) existCount++; else missingCount++; }
            targetCountSpan.innerHTML = '[<span class="auto-op-target-count-exist">' + existCount + '</span>/<span class="auto-op-target-count-missing">' + missingCount + '</span>/<span class="auto-op-target-count-total">' + total + '</span>]';
            return;
        }
        let existCount = status.filter(Boolean).length;
        let missingCount = status.length - existCount;
        let total = targets.length;
        targetCountSpan.innerHTML = '[<span class="auto-op-target-count-exist">' + existCount + '</span>/<span class="auto-op-target-count-missing">' + missingCount + '</span>/<span class="auto-op-target-count-total">' + total + '</span>]';
    }

    function updateTargetItemStyle(index, isMissing) {
        if (uiThrottled) return;
        const item = targetListContainer.querySelector(`.auto-op-target-item[data-index="${index}"]`);
        if (!item) return;
        if (isMissing) { item.classList.remove('active'); item.classList.add('missing'); }
        else { item.classList.remove('missing'); item.classList.add('active'); }
    }

    window._autoopRemoveTarget = async function(index) {
        if (targets[index]) {
            const t = targets[index];
            if (IS_MOBILE && !await showConfirm('确定删除该目标元素？\n\n' + t.desc)) return;
            if (t.element && t.element.classList) t.element.classList.remove('auto-op-selected-highlight');
            if (t._blueParent && t._blueParent.classList) { t._blueParent.classList.remove('auto-op-parent-highlight'); t._blueParent.classList.remove('auto-op-parent-highlight-Overlap'); }
            if (t._nearestEl && t._nearestEl.classList) { t._nearestEl.classList.remove('auto-op-nearest-parent-highlight'); }
            targets.splice(index, 1);
            if (currentQueueIndex >= targets.length) currentQueueIndex = 0;
            updateTargetUI();
            updateTargetCount();
            if (targets.length === 0) {
                stateSpan.textContent = '目标元素已清空';
                if (stateTimerID) { clearTimeout(stateTimerID); stateTimerID = null; }
                stateTimerID = setTimeout(() => { if (stateSpan.textContent === '目标元素已清空') stateSpan.textContent = '请选取目标元素'; stateTimerID = null; }, 1000);
            } else { stateSpan.textContent = `剩余 ${targets.length} 个`; }
            refreshParentHighlights();
            saveData();
            updateAutoFillVisibility();
        }
    };

    // ========== 拖拽逻辑 ==========
    let isDragging = false, dragOffX = 0, dragOffY = 0;
    function getEventPos(e) { return e.touches && e.touches.length > 0 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY }; }
    function onDragStart(e) {
        if (e.target === toggleBtn || toggleBtn.contains(e.target)) return;
        if (e.target === btnHeaderStart || btnHeaderStart.contains(e.target)) return;
        isDragging = true;
        const pos = getEventPos(e);
        const rect = panel.getBoundingClientRect();
        dragOffX = pos.x - rect.left; dragOffY = pos.y - rect.top;
        e.preventDefault();
    }
    function onDragMove(e) { if (!isDragging) return; const pos = getEventPos(e); panel.style.left = (pos.x - dragOffX) + 'px'; panel.style.top = (pos.y - dragOffY) + 'px'; panel.style.right = 'auto'; e.preventDefault(); }
    function onDragEnd() { isDragging = false; }
    dragHandle.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    dragHandle.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
    document.addEventListener('touchcancel', onDragEnd);

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (collapseAnimPhase === 'collapsing' || collapseAnimPhase === 'expanding') return;
        if (collapseAnimPhase !== 'collapsed') performCollapse();
        else performExpand();
    });

    // ========== 交互事件 ==========
    multiModeCheckbox.addEventListener('change', (e) => {
        isMultiMode = e.target.checked;
        strategyRow.style.display = isMultiMode ? 'block' : 'none';
        clickStrategy = strategySelect.value;
        clearSelection();
        saveData();
    });
    strategySelect.addEventListener('change', (e) => { clickStrategy = e.target.value; saveData(); });
    autoFillInput.addEventListener('input', (e) => { autoFillContent = e.target.value; saveData(); });
    [clickIntervalInput, maxClicksInput, missingActionSelect].forEach(el => { el.addEventListener('change', saveData); });

    // 操作最长时间输入事件
    maxDurationInput.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val) || val <= 0) { maxDurationMin = 0; e.target.value = ''; }
        else { maxDurationMin = val; }
        saveData();
    });

    // 自动启动时间间隔输入事件
    autoStartIntervalInput.addEventListener('change', (e) => {
        e.stopPropagation();
        setupAutoStartFromInput();
    });

    autoRefreshCheckbox.addEventListener('change', (e) => {
        e.stopPropagation();
        isAutoRefresh = e.target.checked;
        if (isAutoRefresh) {
            let val = parseInt(refreshIntervalInput.value, 10);
            if (isNaN(val) || val < 10) val = 10;
            if (val > 86400) val = 86400;
            refreshIntervalSec = val;
            refreshIntervalInput.value = val;
            startAutoRefreshCountdown(true);
            addRefreshLog('自动刷新开启 ✓ [' + val + 's]');
        } else {
            const totalMs = refreshIntervalSec * 1000;
            const elapsed = Date.now() - refreshStartTimestamp;
            const remaining = Math.max(0, totalMs - elapsed);
            const remainingSec = Math.ceil(remaining / 1000);
            stopAutoRefreshCountdown();
            addRefreshLog('自动刷新关闭 ✕ [' + remainingSec + 's]');
        }
        saveData();
    });

    refreshIntervalInput.addEventListener('change', (e) => {
        e.stopPropagation();
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 10) val = 10;
        if (val > 86400) val = 86400;
        e.target.value = val;
        refreshIntervalSec = val;
        if (isAutoRefresh) startAutoRefreshCountdown(true);
        saveData();
    });

    btnClearLog.addEventListener('click', (e) => { e.stopPropagation(); refreshLogs = []; updateLogUI(); saveData(); });

    btnPick.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isRunning) return;
        isPicking = !isPicking;
        if (isPicking) {
            btnPick.textContent = '取消选取';
            btnPick.classList.add('picking');
            stateSpan.textContent = isMultiMode ? '请依次点击多个目标元素' : '请点击目标元素';
            stateSpan.classList.remove('auto-op-waiting');
            document.addEventListener('mouseover', onPickHover, true);
            document.addEventListener('mouseout', onPickHoverOut, true);
            document.addEventListener('click', onPickClick, true);
            document.addEventListener('touchend', onPickTouch, true);
        } else { exitPickMode(); }
    });

    function onPickHover(e) { if (!isPicking) return; const el = e.target; if (panel.contains(el)) return; el.classList.add('auto-op-highlight'); }
    function onPickHoverOut(e) { e.target.classList.remove('auto-op-highlight'); }
    function onPickTouch(e) {
        if (!isPicking || isDragging) return;
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!el || panel.contains(el)) return;
        e.preventDefault(); e.stopPropagation();
        selectTarget(el);
    }
    function onPickClick(e) {
        if (!isPicking) return;
        if (!e.isTrusted) return;
        const el = e.target;
        if (panel.contains(el)) return;
        e.preventDefault(); e.stopPropagation();
        selectTarget(el);
    }

    function selectTarget(el) {
        if (stateTimerID) { clearTimeout(stateTimerID); stateTimerID = null; }
        el.classList.remove('auto-op-highlight');
        const sels = buildSelectors(el);
        const fp = getElementFingerprint(el);
        let desc = el.tagName.toLowerCase();
        if (el.id) desc += '#' + el.id;
        if (el.className && typeof el.className === 'string') { const cls = el.className.trim().split(/\s+/).filter(c => c && !c.startsWith('auto-op-')).slice(0, 5).join('.'); if (cls) desc += '.' + cls; }
        const text = getElText(el);
        if (text) desc += ' "' + text + '"';
        const isInput = isInputField(el);
        if (isInput) desc += ' (isInput)';
        let parentSelector = '', parentChain = [];
        let nearestParent = el.parentElement, blueParent = null;
        let ancestor = el.parentElement;
        while (ancestor && ancestor !== document.body) {
            const s = buildBaseSelector(ancestor);
            if (s !== ancestor.tagName.toLowerCase()) {
                if (!parentSelector) parentSelector = s;
                if (!blueParent) blueParent = ancestor;
                let pdesc = ancestor.tagName.toLowerCase();
                if (ancestor.id) pdesc += '#' + ancestor.id;
                if (ancestor.className && typeof ancestor.className === 'string') { const cls = ancestor.className.trim().split(/\s+/).filter(c => c && !c.startsWith('auto-op-')).slice(0, 5).join('.'); if (cls) pdesc += '.' + cls; }
                parentChain.push({ selector: s, desc: pdesc });
            }
            ancestor = ancestor.parentElement;
        }
        const targetObj = { element: el, strict: sels.strict, loose: sels.loose, fingerprint: fp, desc, isInput, matchMode: isInput ? 'loose' : 'strict', parentSelector, parentChain, nearestParent, blueParent, isAuto: false, missCount: 0, _isValid: true };
        if (isMultiMode) {
            targets.push(targetObj);
            el.classList.add('auto-op-selected-highlight');
            stateSpan.textContent = `已选 ${targets.length} 个，继续选取或取消`;
        } else {
            targets.forEach(t => {
                if (t.element && t.element.classList) t.element.classList.remove('auto-op-selected-highlight');
                if (t._blueParent && t._blueParent.classList) { t._blueParent.classList.remove('auto-op-parent-highlight'); t._blueParent.classList.remove('auto-op-parent-highlight-Overlap'); }
                if (t._nearestEl && t._nearestEl.classList) t._nearestEl.classList.remove('auto-op-nearest-parent-highlight');
            });
            targets = [targetObj];
            el.classList.add('auto-op-selected-highlight');
            exitPickMode();
            if (targets.length > 0) stateSpan.textContent = '就绪';
        }
        updateTargetUI(); updateTargetCount(); refreshParentHighlights(); saveData(); updateAutoFillVisibility();
    }

    function exitPickMode() {
        isPicking = false;
        btnPick.textContent = '选取元素';
        btnPick.classList.remove('picking');
        document.removeEventListener('mouseover', onPickHover, true);
        document.removeEventListener('mouseout', onPickHoverOut, true);
        document.removeEventListener('click', onPickClick, true);
        document.removeEventListener('touchend', onPickTouch, true);
        document.querySelectorAll('.auto-op-highlight').forEach(el => el.classList.remove('auto-op-highlight'));
        if (isMultiMode) {
            if (targets.length === 0) stateSpan.textContent = '未选取目标元素';
            else stateSpan.textContent = `已选 ${targets.length} 个`;
        } else {
            if (targets.length === 0) stateSpan.textContent = '未选取目标元素';
            else stateSpan.textContent = '就绪';
        }
        if (targets.length === 0) {
            if (stateTimerID) { clearTimeout(stateTimerID); stateTimerID = null; }
            stateTimerID = setTimeout(() => { if (stateSpan.textContent === '未选取目标元素') stateSpan.textContent = '请选取目标元素'; stateTimerID = null; }, 1500);
        }
    }

    async function clearSelection(manual) {
        if (manual && IS_MOBILE && targets.length > 0 && !await showConfirm('确定清空 ' + targets.length + ' 个目标元素？')) return;
        for (const t of targets) {
            if (t.element && t.element.classList) t.element.classList.remove('auto-op-selected-highlight');
            if (t._blueParent && t._blueParent.classList) { t._blueParent.classList.remove('auto-op-parent-highlight'); t._blueParent.classList.remove('auto-op-parent-highlight-Overlap'); }
            if (t._nearestEl && t._nearestEl.classList) t._nearestEl.classList.remove('auto-op-nearest-parent-highlight');
        }
        targets = [];
        currentQueueIndex = 0;
        updateTargetUI(); updateTargetCount();
        stateSpan.textContent = '目标元素已清空';
        if (stateTimerID) { clearTimeout(stateTimerID); stateTimerID = null; }
        stateTimerID = setTimeout(() => { if (stateSpan.textContent === '目标元素已清空') stateSpan.textContent = '请选取目标元素'; stateTimerID = null; }, 1000);
        refreshParentHighlights(); saveData(); updateAutoFillVisibility();
    }

    btnClearAll.addEventListener('click', (e) => { e.stopPropagation(); clearSelection(true); });

    function handleToggleRunning(e) {
        e.stopPropagation();
        if (targets.length === 0) return;
        if (!isRunning) startClicking();
        else { stopClicking(); stateSpan.textContent = '已停止'; }
    }
    btnStart.addEventListener('click', handleToggleRunning);
    btnHeaderStart.addEventListener('click', handleToggleRunning);

    function startClicking(savedTimestamp) {
        if (stateTimerID) { clearTimeout(stateTimerID); stateTimerID = null; }
        if (isPicking) exitPickMode();
        isWaiting = false;
        if (waitTimerID) { clearTimeout(waitTimerID); waitTimerID = null; }

        for (let i = 0; i < targets.length; i++) {
            const t = targets[i];
            if (!t.element || !document.contains(t.element)) {
                const found = tryFindTarget(t);
                if (found && found.length > 0) {
                    if (t.element && t.element.classList) t.element.classList.remove('auto-op-selected-highlight');
                    t.element = found[0];
                    const parentInfo = resolveParentInfo(found[0]);
                    t.nearestParent = parentInfo.nearestParent;
                    t.blueParent = parentInfo.blueParent;
                    found[0].classList.add('auto-op-selected-highlight');
                }
            } else { if (!t.blueParent) { const parentInfo = resolveParentInfo(t.element); t.nearestParent = parentInfo.nearestParent; t.blueParent = parentInfo.blueParent; } }
        }
        discoverNewTargets();
        const intervalValue = clickIntervalInput.value.trim();
        clickInterval = intervalValue ? parseInt(intervalValue, 10) : 1000;
        isRunning = true;
        clickedCount = 0;
        currentQueueIndex = 0;
        countSpan.textContent = '0';
        const val = maxClicksInput.value.trim();
        maxClicks = val === '' ? Infinity : parseInt(val, 10) || Infinity;

        btnStart.textContent = '停止';
        btnStart.className = 'auto-op-btn auto-op-btn-stop';
        btnHeaderStart.textContent = '■';
        btnHeaderStart.classList.add('is-stop');
        btnPick.disabled = true;
        multiModeCheckbox.disabled = true;
        strategySelect.disabled = true;
        maxClicksInput.disabled = true;
        clickIntervalInput.disabled = true;
        missingActionSelect.disabled = true;
        autoFillInput.disabled = true;
        maxDurationInput.disabled = true;
        autoStartIntervalInput.disabled = true;
        statusDiv.classList.add('running');
        stateSpan.textContent = '运行中';
        stateSpan.classList.remove('auto-op-waiting');

        // 启动已操作时间计时器
        startElapsedTimer(savedTimestamp || 0);

        // 启动操作最长时间定时器
        if (maxDurationMin > 0) {
            const maxDurationMs = maxDurationMin * 60 * 1000;
            if (maxDurationTimerID) clearTimeout(maxDurationTimerID);
            const alreadyElapsed = savedTimestamp ? (Date.now() - savedTimestamp) : 0;
            const remaining = Math.max(0, maxDurationMs - alreadyElapsed);
            if (remaining <= 0) {
                stopClicking();
                stateSpan.textContent = '最长时间已到';
                return;
            }
            maxDurationTimerID = setTimeout(() => {
                if (isRunning) {
                    stopClicking();
                    stateSpan.textContent = '最长时间已到';
                }
            }, remaining);
        }

        // 暂停自动启动倒计时（操作已在运行）
        if (autoStartCountdownTimerID) { clearInterval(autoStartCountdownTimerID); autoStartCountdownTimerID = null; }
        if (autoStartEnabled && autoStartIntervalMin > 0 && autoStartCountdownLabel) autoStartCountdownLabel.textContent = '运行中';

        doClick();
        timerID = setInterval(doClick, clickInterval);
        requestWakeLock();
        suppressFocus();
        saveData();
    }

    function startWaitTimer(idx) {
        if (waitTimerID) clearTimeout(waitTimerID);
        function update() {
            if (!isWaiting || !isRunning) { if (waitTimerID) { clearTimeout(waitTimerID); waitTimerID = null; } return; }
            const maxWait = clickInterval * 2;
            const elapsed = Date.now() - waitStartTime;
            const remaining = maxWait - elapsed;
            if (remaining <= 0) {
                isWaiting = false;
                if (waitTimerID) { clearTimeout(waitTimerID); waitTimerID = null; }
                currentQueueIndex = (idx + 1) % targets.length;
                stateSpan.textContent = `队列[${idx + 1}/${targets.length}] 超时跳过`;
                stateSpan.classList.remove('auto-op-waiting');
                return;
            }
            stateSpan.textContent = `${remaining}ms 队列[${idx + 1}/${targets.length}] 等待元素中`;
            stateSpan.classList.add('auto-op-waiting');
            waitTimerID = setTimeout(update, 1);
        }
        update();
    }

    function doClick() {
        try {
            if (targets.length === 0) { stopClicking(); return; }
            beginQueryCycle();
            discoverNewTargets();
            if (!doClick._lastUIUpdate) doClick._lastUIUpdate = 0;
            const now = Date.now();
            uiThrottled = (now - doClick._lastUIUpdate) < 100;
            if (!uiThrottled) doClick._lastUIUpdate = now;

            const status = targets.map((t, i) => {
                let el = t.element;
                let isValid = el && document.contains(el) && matchesFingerprint(el, t.fingerprint, t.matchMode);
                if (!isValid) {
                    const found = tryFindTarget(t);
                    if (found && found.length > 0) {
                        if (t.element && document.contains(t.element)) t.element.classList.remove('auto-op-selected-highlight');
                        t.element = found[0];
                        const parentInfo = resolveParentInfo(found[0]);
                        t.nearestParent = parentInfo.nearestParent;
                        t.blueParent = parentInfo.blueParent;
                        found[0].classList.add('auto-op-selected-highlight');
                        isValid = true;
                    }
                }
                updateTargetItemStyle(i, !isValid);
                return isValid;
            });

            const totalCount = targets.length;
            for (let i = 0; i < totalCount; i++) targets[i]._isValid = status[i];
            if (!uiThrottled) updateTargetCount(status);

            if (isMultiMode && clickStrategy === 'sequential') {
                const idx = currentQueueIndex;
                if (idx >= totalCount) { currentQueueIndex = 0; return; }
                if (status[idx]) {
                    if (isWaiting) { isWaiting = false; if (waitTimerID) { clearTimeout(waitTimerID); waitTimerID = null; } }
                    const t = targets[idx]; const el = t.element;
                    if (t.isInput) {
                        if (isInputField(el) && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) { el.value = autoFillContent; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
                        else if (el.isContentEditable) el.innerHTML = autoFillContent;
                    } else { el.click(); }
                    clickedCount++;
                    countSpan.textContent = clickedCount;
                    stateSpan.textContent = `队列[${idx + 1}/${totalCount}]`;
                    stateSpan.classList.remove('auto-op-waiting');
                    currentQueueIndex = (idx + 1) % totalCount;
                    if (clickedCount >= maxClicks) { stopClicking(); stateSpan.textContent = '已完成'; }
                } else {
                    if (missingActionSelect.value === 'stop') { stopClicking(); stateSpan.textContent = `队列[${idx + 1}] 元素已消失`; stateSpan.classList.remove('auto-op-waiting'); }
                    else { if (!isWaiting) { isWaiting = true; waitStartTime = Date.now(); startWaitTimer(idx); } }
                }
                cleanupAutoTargets(status);
                return;
            }

            let shouldStop = false, anyClicked = false;
            for (let i = 0; i < totalCount; i++) {
                const t = targets[i];
                if (status[i]) {
                    anyClicked = true;
                    const el = t.element;
                    if (t.isInput) {
                        if (isInputField(el) && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) { el.value = autoFillContent; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
                        else if (el.isContentEditable) el.innerHTML = autoFillContent;
                    } else { el.click(); }
                } else { if (missingActionSelect.value === 'stop') shouldStop = true; }
            }
            if (shouldStop) { stopClicking(); stateSpan.textContent = '元素已消失'; stateSpan.classList.remove('auto-op-waiting'); return; }
            if (anyClicked) {
                clickedCount++;
                countSpan.textContent = clickedCount;
                stateSpan.textContent = isMultiMode && clickStrategy === 'simultaneous' ? '同时操作运行中' : '运行中';
                stateSpan.classList.remove('auto-op-waiting');
                if (clickedCount >= maxClicks) { stopClicking(); stateSpan.textContent = '已完成'; }
            }
            cleanupAutoTargets(status);
        } catch (e) { console.error('[AUTO_OP] doClick 异常:', e); }
    }

    function cleanupAutoTargets(status) {
        for (let i = targets.length - 1; i >= 0; i--) {
            if (!targets[i].isAuto) continue;
            if (status[i] !== undefined && status[i]) targets[i].missCount = 0;
            else if (status[i] === false) {
                targets[i].missCount = (targets[i].missCount || 0) + 1;
                if (targets[i].missCount >= 5) {
                    if (targets[i].element && targets[i].element.classList) targets[i].element.classList.remove('auto-op-selected-highlight');
                    discoveredElements.delete(targets[i].element);
                    targets.splice(i, 1);
                }
            }
        }
        if (targets.length > 0 && currentQueueIndex >= targets.length) currentQueueIndex = 0;
        if (!uiThrottled) refreshParentHighlights();
        if (!uiThrottled) updateTargetUI();
        if (!uiThrottled) updateTargetCount();
    }

    function stopClicking() {
        if (stateTimerID) { clearTimeout(stateTimerID); stateTimerID = null; }
        isRunning = false; isWaiting = false;
        restoreFocus();
        if (!isAutoRefresh) releaseWakeLock();
        if (waitTimerID) { clearTimeout(waitTimerID); waitTimerID = null; }
        clearInterval(timerID); timerID = null;

        // 停止已操作时间计时器
        stopElapsedTimer();

        // 清除操作最长时间定时器
        if (maxDurationTimerID) { clearTimeout(maxDurationTimerID); maxDurationTimerID = null; }

        // 操作停止后，如果自动启动间隔已设置，重新启动倒计时
        if (autoStartEnabled && autoStartIntervalMin > 0) {
            autoStartNextTime = Date.now() + autoStartIntervalMin * 60 * 1000;
            saveAutoStartState();
            startAutoStartCountdownTimer();
        }

        btnStart.textContent = '开始'; btnStart.className = 'auto-op-btn auto-op-btn-start';
        btnHeaderStart.textContent = '▶'; btnHeaderStart.classList.remove('is-stop');
        btnPick.disabled = false; multiModeCheckbox.disabled = false; strategySelect.disabled = false;
        maxClicksInput.disabled = false; clickIntervalInput.disabled = false;
        missingActionSelect.disabled = false; autoFillInput.disabled = false;
        maxDurationInput.disabled = false; autoStartIntervalInput.disabled = false;
        statusDiv.classList.remove('running'); stateSpan.classList.remove('auto-op-waiting');
        if (targets.length > 0) stateSpan.textContent = '就绪';
        else stateSpan.textContent = '请选取目标元素';
        saveData();
    }

    panel.addEventListener('click', (e) => { e.stopPropagation(); });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && (isRunning || isAutoRefresh)) requestWakeLock();
    });

    // ========== 初始化加载 ==========
    loadData();
    goToPage(currentPage, false);
    requestAnimationFrame(() => {
        measureCollapsedWidth();
        panel.style.transition = 'none';
        panel.style.width = collapsedWidth + 'px';
        void panel.offsetWidth;
        panel.style.transition = '';
    });
    pageContainer.querySelectorAll('.auto-op-page').forEach(p => {
        new ResizeObserver(() => updatePageHeight()).observe(p);
    });

    // ========== 恢复自动刷新状态 ==========
    (function restoreAutoRefreshState() {
        const refreshState = loadRefreshState();
        if (refreshState && refreshState.active) {
            if (refreshState.logs && Array.isArray(refreshState.logs)) {
                refreshLogs = refreshState.logs.map(item => {
                    if (typeof item === 'string') return { time: item, msg: '页面已刷新' };
                    return item;
                });
                updateLogUI();
            }
            const now = Date.now();
            const remaining = refreshState.nextRefreshTime - now;
            if (remaining > 0) {
                refreshStartTimestamp = now - (refreshIntervalSec * 1000 - remaining);
                startAutoRefreshCountdown(false);
            } else {
                startAutoRefreshCountdown(true);
            }
            if (refreshState.wasRunning && targets.length > 0) {
                const savedTs = refreshState.operationStartTimestamp || 0;
                setTimeout(() => {
                    if (!isRunning && targets.length > 0) {
                        startClicking(savedTs)
                    }
                }, 600);
            }
            clearRefreshState();
        } else if (isAutoRefresh && refreshIntervalSec >= 10) {
            startAutoRefreshCountdown(true);
        }
    })();

    // ========== 恢复自动启动状态（跨刷新保留） ==========
    (function restoreAutoStartState() {
        const asState = loadAutoStartState();
        if (asState && asState.enabled && asState.intervalMin > 0) {
            autoStartEnabled = true;
            autoStartIntervalMin = asState.intervalMin;
            autoStartIntervalInput.value = autoStartIntervalMin;

            const now = Date.now();
            if (asState.nextStart) {
                const remaining = asState.nextStart - now;
                if (remaining <= 0) {
                    // 已经过了启动时间，立即启动
                    autoStartNextTime = now + autoStartIntervalMin * 60 * 1000;
                    saveAutoStartState();
                    if (!isRunning && targets.length > 0) {
                        setTimeout(() => { if (!isRunning) doAutoStart(); }, 800);
                    }
                } else {
                    // 恢复倒计时
                    autoStartNextTime = asState.nextStart;
                    startAutoStartCountdownTimer();
                }
            } else {
                autoStartNextTime = now + autoStartIntervalMin * 60 * 1000;
                saveAutoStartState();
                startAutoStartCountdownTimer();
            }
            clearAutoStartState(); // 清除临时状态，下次刷新前会重新保存
        } else {
            // 没有持久化的自动启动状态，从配置恢复
            if (autoStartEnabled && autoStartIntervalMin > 0 && !isRunning) {
                autoStartNextTime = Date.now() + autoStartIntervalMin * 60 * 1000;
                saveAutoStartState();
                startAutoStartCountdownTimer();
            }
        }
    })();

    if (DEBUG) {
        console.log(
            '[AUTO_OP]  Automatic-operation  (DEBUG)\n' +
            '  STORAGE_KEY: ' + STORAGE_KEY + '\n' +
            '  IS_MOBILE: ' + IS_MOBILE + '\n' +
            '  isMultiMode: ' + isMultiMode + '\n' +
            '  clickStrategy: ' + clickStrategy + '\n' +
            '  clickInterval: ' + clickInterval + 'ms\n' +
            '  maxClicks: ' + (maxClicks === Infinity ? '∞' : maxClicks) + '\n' +
            '  maxDurationMin: ' + maxDurationMin + '\n' +
            '  missingAction: ' + missingActionSelect.value + '\n' +
            '  autoFillContent: ' + (autoFillContent || '(空)') + '\n' +
            '  targets.length: ' + targets.length + '\n' +
            '  isRunning: ' + isRunning + '\n' +
            '  isPicking: ' + isPicking + '\n' +
            '  isWaiting: ' + isWaiting + '\n' +
            '  clickedCount: ' + clickedCount + '\n' +
            '  currentQueueIndex: ' + currentQueueIndex + '\n' +
            '  uiThrottled: ' + uiThrottled + '\n' +
            '  timerID: ' + timerID + '\n' +
            '  waitTimerID: ' + waitTimerID + '\n' +
            '  stateTimerID: ' + stateTimerID + '\n' +
            '  wakeLock: ' + wakeLock + '\n' +
            '  discoveredElements.size: ' + discoveredElements.size + '\n' +
            '  isAutoRefresh: ' + isAutoRefresh + '\n' +
            '  refreshIntervalSec: ' + refreshIntervalSec + '\n' +
            '  refreshLogs.length: ' + refreshLogs.length + '\n' +
            '  currentPage: ' + currentPage + '\n' +
            '  autoStartEnabled: ' + autoStartEnabled + '\n' +
            '  autoStartIntervalMin: ' + autoStartIntervalMin + '\n' +
            '  autoStartNextTime: ' + autoStartNextTime + '\n' +
            '  maxDurationMin: ' + maxDurationMin
        );
    } else {
        console.log(
            '[AUTO_OP]  Automatic-operation  加载成功\n' +
            '  存储标识         (STORAGE_KEY) : ' + STORAGE_KEY + '\n' +
            '  目标元素数量  (targets.length) : ' + targets.length + '\n' +
            '  多选模式         (isMultiMode) : ' + isMultiMode + '\n' +
            '  操作策略       (clickStrategy) : ' + clickStrategy + '\n' +
            '  操作间隔       (clickInterval) : ' + clickInterval + 'ms\n' +
            '  操作次数           (maxClicks) : ' + (maxClicks === Infinity ? '∞' : maxClicks) + '\n' +
            '  操作最长时间(min)(maxDurationMin): ' + (maxDurationMin > 0 ? maxDurationMin : '不限制') + '\n' +
            '  元素消失后     (missingAction) : ' + missingActionSelect.value + '\n' +
            '  自动填充     (autoFillContent) : ' + (autoFillContent || '(空)') + '\n' +
            '  移动端             (IS_MOBILE) : ' + IS_MOBILE + '\n' +
            '  自动刷新        (isAutoRefresh): ' + isAutoRefresh + '\n' +
            '  刷新间隔(s)(refreshIntervalSec): ' + refreshIntervalSec + '\n' +
            '  刷新日志条数(refreshLogs.length): ' + refreshLogs.length + '\n' +
            '  当前分页        (currentPage) : ' + currentPage + '\n' +
            '  自动启动间隔(min)(autoStartIntervalMin): ' + (autoStartEnabled ? autoStartIntervalMin : '关闭')
        );
    }
})();