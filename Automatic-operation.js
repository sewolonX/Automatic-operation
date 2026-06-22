// ==UserScript==
// @name         Automatic-operation
// @namespace    https://github.com/sewolonX/Automatic-operation
// @version      5.2.0
// @description  不想描述
// @author       sewolon
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @downloadURL  https://sewolon.oss-cn-shanghai.aliyuncs.com/automatic-operation/Automatic-operation.js
// @updateURL    https://sewolon.oss-cn-shanghai.aliyuncs.com/automatic-operation/Automatic-operation.js
// ==/UserScript==

(function() {
	'use strict';
	if (!location.protocol.startsWith('http')) return;
	if (!document.body) {
		console.error('[AUTO_OP] body 跳过:');
		return;
	}
	const IS_TOP = (() => {
		try {
			return window.top === window.self;
		} catch (e) {
			console.error('[AUTO_OP] IS_TOP 异常:', e);
			return true;
		}
	})();
	if (!IS_TOP) return;
	const IS_MOBILE = (() => {
		try {
			return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
		} catch (e) {
			console.error('[AUTO_OP] IS_MOBILE 异常:', e);
			return false;
		}
	})();
	const SHARED_KEY = 'AUTO_OP_SHARED_' + window.location.hostname;
	const REFRESH_STATE_KEY = 'AUTO_OP_REFRESH_STATE_' + window.location.hostname;
	const PER_CONFIG_KEY = 'AUTO_OP_CFG_' + window.location.hostname + '_';
	let isAutoRefresh = false,
		refreshIntervalSec = 60,
		refreshTimerID = null,
		refreshStartTimestamp = 0,
		refreshProgressTimerID = null,
		refreshLogs = [];
	let currentPage = 0;
	const PAGE_COUNT = 5;
	let collapseAnimPhase = 'collapsed',
		collapsedWidth = 300;
	let wakeLock = null,
		stateTimerID = null;
	let isPicking = false,
		isDarkMode = false;
	let originalFocus = HTMLElement.prototype.focus,
		focusinHandler = null;
	let elapsedTimerID_global = null;
	let isProgrammaticClick = false;
	let pickPassThrough = false;
	let panelFont = 'MiSans VF';
	let isPowerSave = false,
		powerSaveTimerID = null;
	let themeMode = 'auto';
	let _testHighlightedElements = [];
	let panelTransparentTimer = null,
		panelClickRestoreTimer = null,
		isPanelTransparent = false;
	let cmdOutputLogs = [],
		cmdHistory = [],
		cmdHistoryIndex = -1;
	let isNetworkMonitoring = false,
		networkRequests = [],
		_origFetch = null,
		_origXHROpen = null,
		_origXHRSend = null,
		_networkReqId = 0;
	const CONFIG_COUNT = 10;
	const CONFIG_NAMES = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
	const CONFIG_SVGS = ['<svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M597.3 370.9 H638.6 Q647.9 370.9 652.8 376.1 Q657.7 381.3 657.7 390.0 V697.1 Q657.7 706.4 652.8 711.3 Q647.9 716.2 638.6 716.2 H604.3 Q592.2 716.2 580.6 711.0 L515.6 677.2 Q501.1 670.0 501.1 654.5 V612.3 Q501.1 600.9 507.8 596.7 Q514.6 592.6 524.3 598.3 L578.2 626.6 V390.0 Q578.2 381.3 583.4 376.1 Q588.6 370.9 597.3 370.9 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>', '<svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M723.5 615.3 Q723.5 663.0 692.6 692.1 Q661.8 721.2 607.6 721.2 Q567.0 721.2 538.9 704.2 Q510.8 687.2 495.2 660.2 Q491.1 652.4 492.6 646.3 Q494.2 640.1 502.0 634.3 L532.8 613.5 Q540.6 608.3 546.8 609.9 Q552.9 611.5 558.1 620.3 Q576.3 648.3 605.6 648.3 Q622.8 648.3 632.9 638.2 Q643.1 628.1 643.1 611.3 Q643.1 596.8 635.3 582.9 Q627.6 569.0 608.8 549.2 L497.4 433.8 Q488.1 424.0 488.1 410.1 V389.0 Q488.1 380.3 493.2 375.1 Q498.4 369.9 507.2 369.9 H711.4 Q720.8 369.9 725.6 375.1 Q730.5 380.3 730.5 389.0 V425.3 Q730.5 434.6 725.6 439.5 Q720.8 444.4 711.4 444.4 H610.2 L671.5 509.1 Q696.9 535.5 710.2 561.1 Q723.5 586.7 723.5 615.3 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>', '<svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M633.9 585.6 L699.4 642.1 Q710.3 650.9 710.3 665.4 V697.1 Q710.3 705.8 705.2 710.7 Q700.0 715.6 691.2 715.6 H513.6 Q504.8 715.6 499.6 710.7 Q494.5 705.8 494.5 697.1 V660.3 Q494.5 651.5 499.6 646.3 Q504.8 641.1 513.6 641.1 H602.2 L539.2 581.2 Q526.3 568.8 537.1 554.3 L558.5 527.1 Q568.8 513.7 583.0 521.3 Q592.0 525.3 602.8 524.7 Q623.6 523.7 635.5 512.1 Q647.3 500.5 647.3 480.3 Q647.3 460.0 635.0 448.4 Q622.6 436.8 601.8 436.8 Q572.2 436.8 552.9 465.3 Q547.8 474.0 541.6 475.6 Q535.4 477.2 527.6 472.0 L496.8 451.2 Q490.1 446.0 487.8 439.6 Q485.5 433.1 489.1 425.9 Q506.1 397.9 534.6 381.1 Q563.2 364.3 602.8 364.3 Q657.0 364.3 691.4 396.7 Q725.8 429.1 725.8 480.3 Q725.8 510.3 713.1 534.1 Q700.3 557.8 678.9 570.6 Q657.5 583.4 633.3 583.6 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>', '<svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M710.2 506.2 H689.1 V694.7 Q689.1 704.1 683.3 709.8 Q677.6 715.6 668.2 715.6 H598.3 Q581.6 715.6 573.9 701.1 L466.8 493.2 Q460.6 480.0 460.6 468.9 V453.6 Q460.6 444.3 466.4 438.5 Q472.2 432.7 482.1 432.7 H609.6 V391.8 Q609.6 381.8 615.7 376.1 Q621.8 370.3 631.1 370.3 H668.2 Q677.6 370.3 683.3 376.1 Q689.1 381.8 689.1 391.8 V432.7 H710.2 Q719.6 432.7 725.3 438.5 Q731.1 444.3 731.1 453.6 V485.3 Q731.1 494.7 725.3 500.4 Q719.6 506.2 710.2 506.2 Z M610.8 620.3 V506.2 H552.9 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>', '<svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M571.1 588.0 L576.5 643.7 H691.1 Q701.0 643.7 706.8 649.5 Q712.5 655.3 712.5 664.6 V694.7 Q712.5 704.1 706.8 709.8 Q701.0 715.6 691.1 715.6 H522.5 Q502.6 715.6 501.1 695.7 L489.1 543.2 Q487.6 526.1 504.2 518.1 L537.1 503.5 Q552.0 496.3 564.7 510.7 Q579.5 526.7 602.6 526.7 Q625.4 526.7 638.2 514.9 Q651.1 503.1 651.1 481.3 Q651.1 461.0 637.9 448.9 Q624.8 436.8 602.6 436.8 Q574.1 436.8 556.7 461.7 Q543.6 478.6 527.5 467.8 L498.8 448.8 Q490.8 443.6 488.5 436.0 Q486.2 428.3 491.0 419.6 Q507.0 393.1 535.8 378.7 Q564.6 364.3 601.0 364.3 Q660.2 364.3 694.8 396.2 Q729.5 428.1 729.5 483.3 Q729.5 535.4 699.4 566.8 Q669.3 598.2 617.6 598.2 Q592.9 598.2 571.1 588.0 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>', '<svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M610.5 598.8 L609.5 599.8 L662.6 690.0 Q668.9 700.9 665.0 708.3 Q661.0 715.6 648.5 715.6 H601.3 Q584.2 715.6 576.9 702.1 L517.6 595.0 Q495.1 556.0 487.1 534.9 Q479.1 513.8 479.1 484.3 Q479.1 432.1 515.7 398.2 Q552.4 364.3 608.6 364.3 Q665.3 364.3 701.7 398.2 Q738.1 432.1 738.1 487.3 Q738.1 538.4 706.4 569.8 Q674.8 601.2 630.2 601.2 Q621.3 601.2 610.5 598.8 Z M560.1 484.3 Q560.1 504.5 574.4 517.1 Q588.8 529.7 611.6 529.7 Q631.4 529.7 644.2 517.1 Q657.1 504.5 657.1 484.3 Q657.1 463.4 643.7 450.1 Q630.4 436.8 609.6 436.8 Q587.8 436.8 573.9 450.1 Q560.1 463.4 560.1 484.3 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>', '<svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M546.3 370.9 H588.8 Q605.5 370.9 612.9 386.0 L734.5 653.7 Q739.7 663.9 739.7 678.6 V694.7 Q739.7 704.7 733.9 710.4 Q728.2 716.2 718.8 716.2 H522.7 Q512.8 716.2 507.0 710.4 Q501.2 704.7 501.2 694.7 L502.2 660.6 Q502.2 651.3 508.0 645.2 Q513.8 639.1 523.1 639.1 H643.5 L530.6 396.6 Q524.8 385.6 529.8 378.3 Q534.8 370.9 546.3 370.9 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>', '<svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M740.1 464.3 Q740.1 496.4 721.6 519.7 Q703.1 543.0 677.9 552.8 V553.8 Q698.7 563.4 713.4 582.6 Q728.1 601.8 728.1 629.8 Q728.1 670.0 694.7 695.6 Q661.3 721.2 608.6 721.2 Q555.8 721.2 522.4 695.6 Q489.1 670.0 489.1 629.8 Q489.1 602.8 504.1 582.6 Q519.1 562.3 537.7 553.8 V552.8 Q512.9 541.8 495.0 518.8 Q477.1 495.8 477.1 464.3 Q477.1 420.1 513.4 392.0 Q549.8 363.9 608.6 363.9 Q667.3 363.9 703.7 392.0 Q740.1 420.1 740.1 464.3 Z M570.1 619.3 Q570.1 633.1 580.7 641.7 Q591.3 650.3 608.6 650.3 Q625.8 650.3 636.4 641.7 Q647.1 633.1 647.1 619.3 Q647.1 605.0 636.7 596.4 Q626.4 587.8 608.6 587.8 Q590.8 587.8 580.4 596.4 Q570.1 605.0 570.1 619.3 Z M559.1 475.8 Q559.1 494.7 572.4 505.8 Q585.8 516.9 608.6 516.9 Q631.4 516.9 644.7 505.8 Q658.1 494.7 658.1 475.8 Q658.1 458.0 644.7 447.2 Q631.4 436.4 608.6 436.4 Q585.8 436.4 572.4 447.2 Q559.1 458.0 559.1 475.8 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>', '<svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M477.1 598.3 Q477.1 548.1 508.9 516.5 Q540.8 484.9 585.0 484.9 Q597.2 484.9 604.7 487.7 L605.1 486.1 L551.6 396.1 Q545.2 385.2 549.2 377.6 Q553.2 369.9 565.7 369.9 H613.2 Q631.5 369.9 638.3 384.0 L697.5 491.1 Q720.1 530.7 728.1 551.2 Q736.1 571.7 736.1 601.8 Q736.1 654.0 699.4 687.6 Q662.8 721.2 606.6 721.2 Q549.8 721.2 513.4 687.3 Q477.1 653.4 477.1 598.3 Z M558.1 601.8 Q558.1 623.1 571.4 636.2 Q584.8 649.3 605.6 649.3 Q627.4 649.3 641.2 636.0 Q655.1 622.7 655.1 601.8 Q655.1 581.0 640.7 568.4 Q626.4 555.8 603.6 555.8 Q583.3 555.8 570.7 568.4 Q558.1 581.0 558.1 601.8 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>', '<svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M864.5 543.3 Q864.5 630.4 831.1 675.8 Q797.8 721.2 734.6 721.2 Q671.8 721.2 637.9 675.8 Q604.1 630.4 604.1 543.3 Q604.1 456.1 637.9 410.5 Q671.8 364.9 734.6 364.9 Q797.8 364.9 831.1 410.3 Q864.5 455.7 864.5 543.3 Z M685.5 543.3 Q685.5 595.1 698.4 620.9 Q711.3 646.7 734.6 646.7 Q758.2 646.7 771.1 620.9 Q784.1 595.1 784.1 543.3 Q784.1 491.4 771.1 465.4 Q758.2 439.4 734.6 439.4 Q711.3 439.4 698.4 465.4 Q685.5 491.4 685.5 543.3 Z M453.6 370.9 H494.8 Q503.6 370.9 508.8 376.1 Q513.9 381.3 513.9 390.0 V697.1 Q513.9 705.8 508.8 711.0 Q503.6 716.2 494.8 716.2 H461.6 Q448.8 716.2 437.3 711.0 L372.2 677.2 Q358.3 670.6 358.3 654.5 V612.3 Q358.3 600.9 364.8 596.7 Q371.2 592.6 381.0 598.3 L434.5 626.6 V390.0 Q434.5 381.3 439.6 376.1 Q444.8 370.9 453.6 370.9 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>'];
	let activeConfig = 0;
	let configs = [];
	for (let i = 0; i < CONFIG_COUNT; i++) {
		configs.push({
			targets: [],
			isRunning: false,
			timerID: null,
			clickedCount: 0,
			maxClicks: Infinity,
			clickInterval: 1000,
			isMultiMode: false,
			clickStrategy: 'simultaneous',
			currentQueueIndex: 0,
			waitStartTime: 0,
			isWaiting: false,
			waitTimerID: null,
			operationStartTimestamp: 0,
			autoStartEnabled: false,
			autoStartIntervalMin: 0,
			autoStartCountdownTimerID: null,
			autoStartNextTime: 0,
			maxDurationMin: 0,
			maxDurationTimerID: null,
			discoveredElements: new Set(),
			uiThrottled: false,
			doClickLastUIUpdate: 0,
			missingAction: 'wait'
		});
	}

	function cv() {
		return configs[activeConfig];
	}
	async function requestWakeLock() {
		if (!wakeLockCheckbox.checked) return;
		try {
			wakeLock = await navigator.wakeLock.request('screen');
		} catch (e) {
			console.error('[AUTO_OP] WakeLock 异常:', e);
		}
	}
	async function releaseWakeLock() {
		if (wakeLock) {
			await wakeLock.release();
			wakeLock = null;
		}
	}

	function suppressFocus() {
		if (!suppressFocusCheckbox.checked) return;
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
		if (focusinHandler) {
			document.removeEventListener('focusin', focusinHandler, true);
			focusinHandler = null;
		}
	}
	const style = document.createElement('style');
	const fontLink = document.createElement('link');
	fontLink.rel = 'stylesheet';
	fontLink.href = 'https://cdn-font.hyperos.mi.com/font/css?family=MiSans_VF:VF:Chinese_Simplify,Latin&display=swap';
	fontLink.onerror = () => {
		fontLink.remove();
		try {
			document.getElementById('auto-op-font-failed').style.display = 'inline';
		} catch (e) {}
	};
	document.head.appendChild(fontLink);
	style.textContent = `

		:root {
			--panel-bg: #18181b;
			--panel-border: #333;
			--panel-text: #e0e0e0;
			--panel-input-bg: #27272a;
			--panel-input-border: #333;
			--panel-input-text: #e0e0e0;
			--panel-label-text: #888;
			--panel-button-bg: rgba(255, 255, 255, 0.06);
			--panel-button-border: rgba(255, 255, 255, 0.1);
			--panel-button-text: #999;
			--panel-button-hover-bg: rgba(255, 255, 255, 0.12);
			--panel-button-hover-text: #fff;
			--panel-highlight-border: #277AF7;
			--panel-active-border: #22c55e;
			--panel-active-text: #22c55e;
			--panel-waiting-text: #f59e0b;
			--panel-highlight: #f59e0b;
			--panel-missing-border: #dc2626;
			--panel-missing-text: #dc2626;
			--auto-op-font: "MiSans VF", system-ui
		}

		[data-theme="light"] {
			--panel-bg: #ffffff;
			--panel-border: #e5e7eb;
			--panel-text: #1f2937;
			--panel-input-bg: #f9fafb;
			--panel-input-border: #d1d5db;
			--panel-input-text: #1f2937;
			--panel-label-text: #6b7280;
			--panel-button-bg: rgba(0, 0, 0, 0.05);
			--panel-button-border: rgba(0, 0, 0, 0.1);
			--panel-button-text: #6b7280;
			--panel-button-hover-bg: rgba(0, 0, 0, 0.1);
			--panel-button-hover-text: #1f2937;
			--panel-highlight-border: #3482FF;
			--panel-active-border: #32d486;
			--panel-active-text: #32d486;
			--panel-waiting-text: #d97706;
			--panel-highlight: #d97706;
			--panel-missing-border: #dc2626;
			--panel-missing-text: #dc2626
		}

		[data-theme="light"] .auto-op-status {
			border-top-color: #999
		}

		[data-theme="light"] .auto-op-switch-track {
			border-color: #d1d5db;
			background: #dedede
		}

		[data-theme="light"] .auto-op-switch-thumb {
			background: #ffffff
		}

		[data-theme="light"] .auto-op-modal-overlay {
			background: rgba(0, 0, 0, 0.2)
		}

		[data-theme="light"] .auto-op-log-entry {
			border-bottom-color: rgba(0, 0, 0, 0.04)
		}

		[data-theme="light"] .auto-op-config-btn {
			background: rgba(0, 0, 0, 0.05);
			border-color: rgba(0, 0, 0, 0.1);
			color: #6b7280
		}

		[data-theme="light"] .auto-op-config-btn:hover {
			background: rgba(0, 0, 0, 0.1);
			color: #1f2937
		}

		[data-theme="light"] .auto-op-config-menu {
			background: #ffffff;
			border-color: #e5e7eb;
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12)
		}

		[data-theme="light"] .auto-op-config-item {
			color: #1f2937
		}

		[data-theme="light"] .auto-op-config-item:hover {
			background: rgba(0, 0, 0, 0.06)
		}

		[data-theme="light"] .auto-op-config-item.active {
			color: var(--panel-highlight-border);
			background: rgba(0, 0, 0, 0.04)
		}

		#auto-op-panel {
			position: fixed;
			top: 85px;
			left: 35px;
			z-index: 2147483647 !important;
			background: var(--panel-bg);
			color: var(--panel-text);
			border: 1px solid var(--panel-border);
			border-radius: 12px;
			padding: 0;
			width: 300px;
			font-size: 13px !important;
			font-family: var(--auto-op-font) !important;
			box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
			transition: opacity 0.4s, width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
			overflow: hidden;
			display: flex;
			flex-direction: column;
			font-variant-numeric: tabular-nums !important;
			text-align: left !important;
			contain: layout style !important;
			isolation: isolate !important;
			will-change: width
		}

		.auto-op-header {
			position: sticky;
			top: 0;
			background: var(--panel-bg);
			border-bottom: 1px solid var(--panel-border);
			padding: 14px;
			cursor: move;
			touch-action: none;
			z-index: 1;
			display: flex;
			align-items: center;
			flex-shrink: 0
		}

		.auto-op-header h3 {
			margin: 0;
			font-size: 18px;
			font-weight: 800;
			font-family: inherit;
			color: var(--panel-text);
			display: flex;
			align-items: center;
			gap: 8px;
			min-width: 0;
			overflow: hidden;
			white-space: nowrap;
			flex: 1 1 auto;
			text-align: right;
			justify-content: flex-end
		}

		.auto-op-toggle {
			flex-shrink: 0;
			width: 30px;
			height: 30px;
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			color: var(--panel-button-text);
			font-size: 18px;
			font-family: var(--auto-op-font);
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0;
			border-radius: 6px;
			line-height: 1;
			transition: background 0.3s, color 0.3s, transform 0.15s ease;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-toggle:hover {
			background: var(--panel-button-hover-bg);
			color: var(--panel-button-hover-text)
		}

		.auto-op-toggle:active {
			transform: scale(0.85) !important
		}

		.auto-op-config-wrap {
			flex-shrink: 0;
			margin-left: 12px
		}

		.auto-op-config-btn {
			width: 30px;
			height: 30px;
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			color: var(--panel-button-text);
			font-size: 15px;
			font-weight: 500;
			font-family: var(--auto-op-font);
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0;
			border-radius: 6px;
			line-height: 1;
			transition: background 0.3s, color 0.3s, transform 0.15s ease;
			-webkit-tap-highlight-color: transparent;
			user-select: none;
			white-space: nowrap;
			overflow: hidden
		}

		.auto-op-config-btn:hover {
			background: var(--panel-button-hover-bg);
			color: var(--panel-button-hover-text)
		}

		.auto-op-config-btn:active {
			transform: scale(0.85) !important
		}

		.auto-op-config-menu {
			display: block;
			position: fixed;
			background: var(--panel-bg);
			border: 1px solid var(--panel-border);
			border-radius: 8px;
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
			z-index: 2147483647;
			width: 64px;
			scrollbar-width: none;
			opacity: 0;
			transform: scale(0.4);
			transform-origin: top left;
			transition: opacity 0.24s ease, transform 0.24s ease;
			pointer-events: none;
			will-change: transform, opacity
		}

		.auto-op-config-menu::-webkit-scrollbar {
			display: none
		}

		.auto-op-config-menu.open {
			opacity: 1;
			transform: scale(1);
			pointer-events: auto
		}

		.auto-op-config-menu.closing {
			opacity: 0;
			transform: scale(0.4);
			pointer-events: none
		}

		.auto-op-config-item {
			padding: 8px 16px;
			font-size: 16px;
			font-weight: 500;
			font-family: var(--auto-op-font);
			color: var(--panel-text);
			cursor: pointer;
			white-space: nowrap;
			text-align: center;
			transition: background 0.15s;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-config-item:first-child {
			border-radius: 7px 7px 0 0
		}

		.auto-op-config-item:last-child {
			border-radius: 0 0 7px 7px
		}

		.auto-op-config-item:hover {
			background: var(--panel-button-hover-bg)
		}

		.auto-op-config-item.active {
			color: var(--panel-highlight-border);
			background: var(--panel-button-bg)
		}

		.auto-op-config-item.has-run {
			position: relative
		}

		.auto-op-config-item.has-run::after {
			content: '';
			position: absolute;
			top: 50%;
			right: 10px;
			transform: translateY(-50%);
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background: var(--panel-active-border)
		}

		.auto-op-header-start {
			flex-shrink: 0;
			width: 30px;
			height: 30px;
			border: none;
			color: #fff;
			font-size: 14px;
			font-family: inherit;
			cursor: pointer;
			display: none;
			align-items: center;
			justify-content: center;
			padding: 0;
			border-radius: 6px;
			margin-left: 12px;
			margin-right: 12px;
			line-height: 0;
			transition: background 0.3s, opacity 0.3s ease, transform 0.15s ease;
			background: var(--panel-active-border);
			opacity: 0.9 !important;
			text-align: center;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-header-start:hover {
			background: var(--panel-active-border);
			opacity: 1 !important
		}

		.auto-op-header-start.is-stop {
			background: var(--panel-missing-border);
			opacity: 0.9 !important
		}

		.auto-op-header-start.is-stop:hover {
			background: var(--panel-missing-border);
			opacity: 1 !important
		}

		.auto-op-header-start:active {
			transform: scale(0.85) !important
		}

		.auto-op-header-start:disabled {
			opacity: 0.4 !important;
			cursor: not-allowed
		}

		.auto-op-body {
			padding: 14px;
			overflow: hidden auto;
			max-height: 65vh;
			transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), min-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s ease, opacity 0.3s ease;
			opacity: 1
		}

		.auto-op-body::-webkit-scrollbar {
			display: none
		}

		#auto-op-panel.collapsing .auto-op-body {
			max-height: 0 !important;
			min-height: 0 !important;
			padding: 0 !important;
			margin: 0 !important;
			border-width: 0 !important;
			opacity: 0;
			overflow: hidden;
			contain: layout !important;
			transition: max-height 0.35s ease, padding 0.25s ease, margin 0.25s ease, border-width 0.25s ease, opacity 0.3s ease
		}

		#auto-op-panel.collapsed {
			gap: 0 !important
		}

		#auto-op-panel.collapsed .auto-op-header {
			justify-content: flex-start;
			border-bottom-color: transparent
		}

		#auto-op-panel.collapsed .auto-op-header h3 {
			flex: 0 0 auto !important;
			margin-left: auto
		}

		#auto-op-panel.collapsed .auto-op-header-start {
			display: flex;
			opacity: 0;
			animation: auto-op-fade-in 0.3s ease 0.1s forwards
		}

		#auto-op-panel.collapsed .auto-op-body {
			max-height: 0 !important;
			min-height: 0 !important;
			padding: 0 !important;
			margin: 0 !important;
			border-width: 0 !important;
			opacity: 0;
			overflow: hidden;
			visibility: hidden;
			contain: layout !important
		}

		#auto-op-panel.body-hidden .auto-op-body {
			max-height: 0 !important;
			min-height: 0 !important;
			padding: 0 !important;
			margin: 0 !important;
			border-width: 0 !important;
			opacity: 0;
			overflow: hidden;
			contain: layout !important;
			transition: max-height 0.35s ease, padding 0.25s ease, opacity 0.3s ease
		}

		.auto-op-row {
			padding-top: 3px;
			margin-bottom: 12px;
			min-height: 0
		}

		.auto-op-row label {
			display: block;
			font-size: 11px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			color: var(--panel-label-text);
			margin-bottom: 5px;
			letter-spacing: 0.5px
		}

		.auto-op-row input[type="number"],
		.auto-op-row select,
		.auto-op-row input[type="text"] {
			width: 100%;
			background: var(--panel-input-bg) !important;
			border: 1px solid var(--panel-input-border) !important;
			border-radius: 6px;
			color: var(--panel-input-text) !important;
			padding: 7px 10px;
			font-size: 13px;
			font-family: var(--auto-op-font);
			font-variant-numeric: tabular-nums;
			box-sizing: border-box;
			outline: none
		}

		.auto-op-row select {
			-webkit-appearance: none;
			appearance: none
		}

		.auto-op-row input[type="number"]:focus,
		.auto-op-row select:focus,
		.auto-op-row input[type="text"]:focus {
			border-color: var(--panel-highlight-border) !important
		}

		.auto-op-row input[type="number"]::placeholder {
			color: var(--panel-label-text)
		}

		.auto-op-row select option {
			background: var(--panel-input-bg);
			color: var(--panel-input-text)
		}

		.auto-op-row-switch {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 12px
		}

		.auto-op-row-switch label {
			margin-bottom: 0;
			flex: 1;
			font-size: 11px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			color: var(--panel-label-text);
			letter-spacing: 0.5px
		}

		.auto-op-switch {
			position: relative;
			width: 36px;
			height: 20px;
			flex: 0 0 36px !important;
			-webkit-tap-highlight-color: transparent
		}

		.auto-op-switch input {
			opacity: 0;
			width: 0;
			height: 0;
			position: absolute
		}

		.auto-op-switch-track {
			position: absolute;
			inset: 0;
			background: #27272a;
			border: 1px solid var(--panel-input-border);
			border-radius: 10px;
			cursor: pointer;
			transition: background 0.3s, border-color 0.3s;
			display: flex;
			align-items: center
		}

		.auto-op-switch-thumb {
			width: 14px;
			height: 14px;
			background: #999;
			border-radius: 50%;
			transition: transform 0.3s, background 0.3s;
			pointer-events: none;
			flex-shrink: 0;
			transform: translateX(3px)
		}

		.auto-op-switch input:checked+.auto-op-switch-track {
			background: var(--panel-highlight-border);
			border-color: var(--panel-highlight-border)
		}

		.auto-op-switch input:checked+.auto-op-switch-track .auto-op-switch-thumb {
			transform: translateX(18px);
			background: #fff
		}

		.auto-op-target-list-container {
			min-height: 0
		}

		.auto-op-target-info {
			background: var(--panel-input-bg);
			border: 1px solid var(--panel-input-border);
			border-radius: 6px;
			padding: 8px 10px;
			font-size: 12px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			color: var(--panel-label-text);
			word-break: break-all;
			line-height: 1.5
		}

		.auto-op-target-list {
			max-height: 350px;
			overflow-y: auto;
			display: flex;
			flex-direction: column;
			gap: 8px;
			scrollbar-width: none;
			-ms-overflow-style: none
		}

		.auto-op-target-list::-webkit-scrollbar {
			display: none
		}

		.auto-op-target-item {
			background: var(--panel-input-bg);
			border: 1px solid var(--panel-input-border);
			border-radius: 6px;
			padding: 8px 10px;
			font-size: 12px;
			font-family: var(--auto-op-font);
			color: var(--panel-highlight-border);
			word-break: break-all;
			line-height: 1.5;
			position: relative;
			min-height: 54px;
			max-height: 80px;
			overflow-y: auto;
			box-sizing: border-box;
			transition: border-color 0s, color 0s;
			scrollbar-width: none;
			-ms-overflow-style: none
		}

		.auto-op-target-item::-webkit-scrollbar {
			display: none
		}

		.auto-op-target-item.active {
			border-color: var(--panel-active-border);
			color: var(--panel-active-text)
		}

		.auto-op-target-item.missing {
			border-color: var(--panel-missing-border);
			color: var(--panel-missing-text)
		}

		.auto-op-target-item.cmd-target {
			border-color: var(--panel-highlight-border)
		}

		.auto-op-target-item.cmd-target span {
			color: var(--panel-highlight-border)
		}

		.auto-op-target-item.cmd-target.cmd-error span {
			color: var(--panel-missing-border)
		}

		.auto-op-target-item.cmd-target .auto-op-btn-info {
			display: none
		}

		.auto-op-target-item span {
			display: block;
			padding-right: 20px;
			white-space: pre-wrap;
			font-weight: 600
		}

		.auto-op-target-parent {
			display: block;
			padding-right: 0px !important;
			font-size: 11px;
			font-weight: 600;
			color: var(--panel-highlight-border);
			margin-bottom: 2px
		}

		.auto-op-btn-info {
			position: absolute;
			top: 24px;
			right: 24px;
			width: 16px;
			height: 16px;
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			color: var(--panel-button-text);
			border-radius: 4px;
			cursor: pointer;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s;
			opacity: 0.9;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-btn-info:hover {
			background: var(--panel-highlight-border);
			color: #fff;
			border-color: var(--panel-highlight-border);
			opacity: 1
		}

		.auto-op-btn-info:active {
			transform: scale(0.85) !important
		}

		.auto-op-btn-settings {
			position: absolute;
			top: 24px;
			right: 4px;
			width: 16px;
			height: 16px;
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			color: var(--panel-button-text);
			border-radius: 4px;
			cursor: pointer;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s;
			opacity: 0.9;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-btn-settings:hover {
			background: var(--panel-highlight-border);
			color: #fff;
			border-color: var(--panel-highlight-border);
			opacity: 1
		}

		.auto-op-btn-settings:active {
			transform: scale(0.85) !important
		}

		.auto-op-btn-item-del {
			position: absolute;
			top: 4px;
			right: 4px;
			width: 16px;
			height: 16px;
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			color: var(--panel-button-text);
			border-radius: 4px;
			cursor: pointer;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s;
			opacity: 0.9;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-btn-item-del:hover {
			background: var(--panel-missing-border);
			color: #fff;
			border-color: var(--panel-missing-border);
			opacity: 1
		}

		.auto-op-btn-item-del:active {
			transform: scale(0.85) !important
		}

		.auto-op-btn-move {
			position: absolute;
			width: 16px;
			height: 16px;
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			color: var(--panel-button-text);
			border-radius: 4px;
			cursor: pointer;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s;
			z-index: 1;
			opacity: 0.9;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-btn-move:hover {
			background: var(--panel-button-hover-bg);
			color: var(--panel-button-hover-text);
			opacity: 1
		}

		.auto-op-btn-move:active {
			transform: scale(0.85) !important
		}

		.auto-op-btn-move-up {
			top: 4px;
			right: 44px
		}

		.auto-op-btn-move-down {
			top: 4px;
			right: 24px
		}

		.auto-op-btn-group {
			display: flex;
			gap: 8px;
			margin-top: 14px
		}

		.auto-op-btn {
			flex: 1;
			padding: 9px 0;
			border: none;
			border-radius: 6px;
			font-size: 13px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			cursor: pointer;
			transition: all 0.3s;
			display: flex;
			align-items: center;
			justify-content: center;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-btn:active {
			transform: scale(0.96) !important
		}

		.auto-op-btn-pick {
			background: var(--panel-button-bg);
			color: var(--panel-button-text)
		}

		.auto-op-btn-pick:hover {
			background: var(--panel-button-hover-bg);
			color: var(--panel-button-hover-text)
		}

		.auto-op-btn-pick.picking {
			background: var(--panel-waiting-text);
			color: #000;
			animation: auto-op-pulse 1s infinite !important
		}

		.auto-op-btn-pick:disabled,
		.auto-op-btn-start:disabled {
			opacity: 0.4;
			cursor: not-allowed
		}

		.auto-op-btn-start {
			background: var(--panel-active-border);
			color: #fff
		}

		.auto-op-btn-start:hover {
			background: var(--panel-active-border)
		}

		.auto-op-btn-stop {
			background: var(--panel-missing-border);
			color: #fff
		}

		.auto-op-btn-stop:hover {
			background: var(--panel-missing-border)
		}

		.auto-op-status {
			margin-top: 12px;
			padding-top: 12px;
			border-top: 1px solid #888;
			font-size: 12px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			color: var(--panel-label-text);
			display: flex;
			justify-content: space-between;
			align-items: center
		}

		.auto-op-status .auto-op-count {
			color: var(--panel-highlight-border);
			font-size: 14px;
			font-family: var(--auto-op-font)
		}

		.auto-op-status.running .auto-op-count {
			animation: auto-op-pulse 0.8s infinite !important
		}

		.auto-op-status .auto-op-waiting {
			color: var(--panel-waiting-text);
			font-size: 11px;
			font-family: var(--auto-op-font)
		}

		.auto-op-status .auto-op-elapsed {
			color: var(--panel-highlight-border);
			font-size: 11px;
			font-weight: 700;
			font-family: var(--auto-op-font);
			font-variant-numeric: tabular-nums;
			margin-left: 8px
		}

		.auto-op-highlight {
			outline: 2px dashed var(--panel-highlight) !important;
			outline-offset: 1px !important;
			cursor: crosshair !important
		}

		.auto-op-selected-highlight {
			outline: 2px solid var(--panel-active-border) !important;
			outline-offset: 1px !important
		}

		.auto-op-parent-highlight {
			box-shadow: 0 0 0 4px var(--panel-highlight-border) !important;
			outline-offset: -2px !important;
			position: relative !important
		}

		.auto-op-parent-highlight-Overlap {
			box-shadow: 0 0 0 2px var(--panel-highlight-border) !important;
			position: relative !important
		}

		.auto-op-nearest-parent-highlight {
			outline: 2px dashed var(--panel-missing-border) !important;
			outline-offset: -2px !important;
			position: relative !important
		}

		.auto-op-btn-clear {
			flex-shrink: 0;
			padding: 0px;
			font-size: 11px;
			font-family: var(--auto-op-font);
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			color: var(--panel-button-text);
			border-radius: 4px;
			cursor: pointer;
			white-space: nowrap;
			max-width: 35px;
			max-height: 16px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			font-weight: 600;
			transition: all 0.3s;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-btn-clear:hover {
			background: var(--panel-missing-border);
			color: #fff;
			border-color: var(--panel-missing-border)
		}

		.auto-op-btn-clear:active {
			transform: scale(0.85) !important
		}

		.auto-op-target-count {
			font-size: 11px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			margin-left: 6px;
			display: inline-flex;
			align-items: center
		}

		.auto-op-target-count-exist {
			color: var(--panel-active-text)
		}

		.auto-op-target-count-missing {
			color: var(--panel-missing-text)
		}

		.auto-op-target-count-total {
			color: var(--panel-highlight-border)
		}

		@keyframes auto-op-pulse {

			0%,
			100% {
				opacity: 1
			}

			50% {
				opacity: 0.5
			}
		}

		@keyframes auto-op-fade-in {
			from {
				opacity: 0
			}

			to {
				opacity: 0.9
			}
		}

		.auto-op-modal-overlay {
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.5);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 2147483647
		}

		.auto-op-modal-box {
			background: var(--panel-bg);
			border: 1px solid var(--panel-border);
			border-radius: 10px;
			padding: 20px;
			min-width: 240px;
			max-width: 275px;
			max-height: 250px;
			overflow-y: auto;
			display: flex;
			flex-direction: column
		}

		.auto-op-modal-text {
			font-size: 13px;
			font-weight: 500;
			font-family: var(--auto-op-font);
			color: var(--panel-text);
			line-height: 1.6;
			margin-bottom: 16px;
			word-break: break-all;
			white-space: pre-wrap;
			flex: 1 1 auto;
			overflow-y: auto;
			min-height: 0
		}

		.auto-op-modal-btns {
			display: flex;
			gap: 8px;
			flex-shrink: 0
		}

		.auto-op-modal-btn {
			flex: 1;
			padding: 8px 0;
			border: none;
			border-radius: 6px;
			font-size: 13px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			cursor: pointer;
			transition: all 0.3s;
			display: flex;
			align-items: center;
			justify-content: center;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-modal-btn:active {
			transform: scale(0.96) !important
		}

		.auto-op-modal-cancel {
			background: var(--panel-button-bg);
			color: var(--panel-button-text)
		}

		.auto-op-modal-cancel:hover {
			background: var(--panel-button-hover-bg);
			color: var(--panel-button-hover-text)
		}

		.auto-op-modal-ok {
			background: var(--panel-missing-border);
			color: #fff;
			opacity: 0.9 !important
		}

		.auto-op-modal-ok:hover {
			opacity: 1 !important
		}

		.auto-op-progress-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 8px;
			margin-bottom: 6px;
			font-family: var(--auto-op-font)
		}

		.auto-op-progress-percent {
			color: var(--panel-highlight-border);
			font-size: 14px;
			font-weight: 700;
			font-variant-numeric: tabular-nums
		}

		.auto-op-progress-time {
			color: var(--panel-label-text);
			font-size: 12px;
			font-weight: 600;
			font-variant-numeric: tabular-nums
		}

		.auto-op-progress-container {
			width: 100%;
			height: 8px;
			background: var(--panel-input-bg);
			border: 1px solid var(--panel-input-border);
			border-radius: 4px;
			overflow: hidden;
			margin-bottom: 12px
		}

		.auto-op-progress-fill {
			height: 100%;
			width: 0%;
			background: var(--panel-highlight-border);
			border-radius: 3px;
			transition: width 0.3s ease, background-color 0.5s ease
		}

		.auto-op-log-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 5px
		}

		.auto-op-log-header label {
			margin-bottom: 0;
			font-size: 11px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			color: var(--panel-label-text);
			letter-spacing: 0.5px
		}

		.auto-op-log-container {
			background: var(--panel-input-bg);
			border: 1px solid var(--panel-input-border);
			border-radius: 6px;
			padding: 8px 10px;
			max-height: 300px;
			overflow-y: auto;
			font-size: 11px;
			font-family: var(--auto-op-font);
			color: var(--panel-label-text);
			scrollbar-width: none
		}

		.auto-op-log-container::-webkit-scrollbar {
			display: none
		}

		.auto-op-log-entry {
			padding: 3px 0;
			border-bottom: 1px solid rgba(255, 255, 255, 0.04);
			line-height: 1.5;
			word-break: break-all
		}

		.auto-op-log-entry:last-child {
			border-bottom: none
		}

		.auto-op-log-time {
			color: var(--panel-highlight-border);
			font-weight: 700;
			margin-right: 4px
		}

		.auto-op-log-msg {
			color: var(--panel-text);
			font-weight: 500
		}

		.auto-op-log-empty {
			color: var(--panel-label-text);
			font-style: italic;
			text-align: center;
			padding: 6px 0;
			font-size: 11px
		}

		.auto-op-page-selector {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 3px;
			margin: 0 0 10px;
			gap: 3px;
			flex-shrink: 0;
			background: var(--panel-button-bg);
			border-radius: 8px;
			border: 1px solid var(--panel-button-border)
		}

		.auto-op-page-btn {
			flex: 1;
			height: 30px;
			border: none;
			background: transparent;
			color: var(--panel-button-text);
			border-radius: 6px;
			cursor: pointer;
			font-size: 14px;
			font-weight: 700;
			font-family: var(--auto-op-font);
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0;
			transition: background 0.3s, color 0.3s, transform 0.15s ease;
			-webkit-tap-highlight-color: transparent;
			user-select: none;
			flex-shrink: 0
		}

		.auto-op-page-btn:hover:not(.active) {
			opacity: 0.65
		}

		.auto-op-page-btn:active {
			transform: scale(0.85) !important
		}

		.auto-op-page-btn.active {
			background: var(--panel-button-hover-bg);
			color: var(--panel-button-hover-text)
		}

		.auto-op-page-container {
			position: relative;
			width: 100%;
			overflow: hidden;
			transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1)
		}

		.auto-op-page {
			display: none;
			opacity: 0;
			transition: opacity 0.2s ease
		}

		.auto-op-page.active {
			display: block;
			opacity: 1
		}

		.auto-op-row .auto-op-label-with-countdown {
			display: flex;
			align-items: center;
			justify-content: space-between
		}

		.auto-op-row .auto-op-autostart-countdown {
			font-size: 10px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			color: var(--panel-waiting-text);
			white-space: nowrap;
			flex-shrink: 0
		}

		.auto-op-cmd-input {
			width: 100%;
			box-sizing: border-box;
			background: var(--panel-input-bg) !important;
			border: 1px solid var(--panel-input-border) !important;
			border-radius: 6px;
			color: var(--panel-input-text) !important;
			font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", "Consolas", monospace;
			font-size: 12px;
			padding: 7px 10px;
			resize: vertical;
			line-height: 1.5;
			tab-size: 2;
			outline: none;
			transition: border-color 0.2s
		}

		.auto-op-cmd-input:focus {
			border-color: var(--panel-highlight-border);
			box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.15)
		}

		.auto-op-cmd-input::placeholder {
			color: var(--panel-label-text);
			opacity: 0.6
		}

		.auto-op-cmd-presets {
			margin-top: 0 !important
		}

		.auto-op-cmd-presets select {
			width: 100%;
			box-sizing: border-box;
			background: var(--panel-input-bg) !important;
			border: 1px solid var(--panel-input-border) !important;
			border-radius: 6px;
			color: var(--panel-input-text) !important;
			font-family: var(--auto-op-font);
			font-size: 11px;
			padding: 6px 8px;
			outline: none
		}

		.auto-op-cmd-btns {
			display: flex;
			gap: 6px
		}

		.auto-op-btn-cmd-test,
		.auto-op-btn-cmd-target {
			flex: 1;
			height: 28px;
			border: 1px solid var(--panel-button-border);
			border-radius: 6px;
			cursor: pointer;
			font-size: 11px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			transition: background 0.2s, transform 0.1s, opacity 0.2s;
			-webkit-tap-highlight-color: transparent;
			background: var(--panel-button-bg);
			color: var(--panel-button-text)
		}
		.auto-op-btn-cmd-target:hover:not(:disabled) {
			background: var(--panel-button-hover-bg)
		}
		.auto-op-btn-cmd-target:disabled {
			opacity: 0.4;
			cursor: not-allowed
		}

		.auto-op-btn-cmd-test {
			background: var(--panel-highlight-border);
			color: #fff
		}

		.auto-op-btn-cmd-test:hover {
			opacity: 0.85
		}



		.auto-op-cmd-output {
			background: var(--panel-input-bg);
			border: 1px solid var(--panel-input-border);
			border-radius: 6px;
			padding: 8px 10px;
			max-height: 220px;
			overflow-y: auto;
			font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", "Consolas", monospace;
			font-size: 11px;
			color: var(--panel-text);
			scrollbar-width: none;
			line-height: 1.5;
			word-break: break-all
		}

		.auto-op-cmd-output::-webkit-scrollbar {
			display: none
		}

		.auto-op-cmd-output-entry {
			padding: 2px 0;
			border-bottom: 1px solid var(--panel-button-border)
		}

		.auto-op-cmd-output-entry:last-child {
			border-bottom: none
		}

		.auto-op-cmd-output-time {
			color: var(--panel-label-text);
			margin-right: 4px
		}

		.auto-op-cmd-output-log {
			color: var(--panel-text)
		}

		.auto-op-cmd-output-warn {
			color: var(--panel-waiting-text)
		}

		.auto-op-cmd-output-info {
			color: var(--panel-highlight-border)
		}

		.auto-op-cmd-output-debug {
			color: #F8BBD0
		}

		.auto-op-cmd-output-result {
			color: var(--panel-active-border)
		}

		.auto-op-cmd-output-error {
			color: var(--panel-missing-border)
		}

		.auto-op-cmd-output-empty {
			color: var(--panel-label-text);
			font-style: italic;
			text-align: center;
			padding: 6px 0
		}

		.auto-op-network-btn {
			width: 24px;
			height: 24px;
			border: none;
			background: transparent;
			color: var(--panel-button-text);
			cursor: pointer;
			border-radius: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0;
			flex-shrink: 0;
			transition: opacity 0.2s;
			-webkit-tap-highlight-color: transparent
		}

		.auto-op-network-btn:hover {
			opacity: 0.65
		}

		.auto-op-network-btn.active {
			color: var(--panel-highlight-border)
		}

		.auto-op-network-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: var(--panel-bg);
			z-index: 5;
			display: none;
			flex-direction: column;
			border-radius: 0 0 12px 12px;
			overflow: hidden;
			transform: translateX(105%);
			transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
			will-change: transform
		}

		.auto-op-network-overlay.open {
			display: flex;
			transform: translateX(0)
		}

		.auto-op-network-header {
			display: flex;
			align-items: center;
			padding: 10px 12px;
			gap: 8px;
			border-bottom: 1px solid var(--panel-button-border);
			flex-shrink: 0;
			cursor: move;
			touch-action: none
		}

		.auto-op-network-back-btn {
			width: 28px;
			height: 28px;
			padding: 0;
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			color: var(--panel-button-text);
			cursor: pointer;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			transition: background 0.3s, color 0.3s, transform 0.15s ease;
			-webkit-tap-highlight-color: transparent
		}

		.auto-op-network-back-btn:hover {
			background: var(--panel-button-hover-bg);
			color: var(--panel-button-hover-text)
		}

		.auto-op-network-title {
			font-size: 13px;
			font-weight: 700;
			font-family: var(--auto-op-font);
			color: var(--panel-text);
			flex: 1
		}

		.auto-op-network-header-right {
			display: flex;
			align-items: center;
			gap: 6px;
			flex-shrink: 0
		}

		.auto-op-network-count {
			font-size: 11px;
			font-weight: 700;
			font-family: var(--auto-op-font);
			font-variant-numeric: tabular-nums;
			color: var(--panel-label-text);
			min-width: 20px;
			text-align: right
		}

		.auto-op-network-toolbar {
			display: flex;
			gap: 6px;
			padding: 6px 12px;
			border-bottom: 1px solid var(--panel-button-border);
			flex-shrink: 0
		}

		.auto-op-network-toolbar .auto-op-btn-clear {
			font-size: 10px;
			padding: 4px 10px;
			max-width: none;
			max-height: none
		}
		#auto-op-btn-copy-all-network {
			padding: 4px 14px
		}

		#auto-op-btn-copy-all-network:hover,
		#auto-op-btn-copy-all-network:active {
			background: var(--panel-highlight-border);
			color: #fff;
			border-color: var(--panel-highlight-border)
		}

		.auto-op-network-content {
			flex: 1;
			overflow-y: auto;
			scrollbar-width: none;
			padding: 6px 0
		}

		.auto-op-network-content::-webkit-scrollbar {
			display: none
		}

		.auto-op-network-empty {
			display: block;
			text-align: center;
			padding: 20px 12px;
			font-size: 11px;
			font-family: var(--auto-op-font);
			color: var(--panel-label-text);
			font-style: italic
		}

		.auto-op-network-item {
			border-bottom: 1px solid var(--panel-button-border);
			padding: 8px 12px;
			cursor: pointer;
			transition: background 0.15s;
			font-family: var(--auto-op-font)
		}

		.auto-op-network-item:hover {
			background: var(--panel-button-hover-bg)
		}

		.auto-op-network-item.expanded {
			background: var(--panel-button-hover-bg)
		}

		.auto-op-network-item-top {
			display: flex;
			align-items: center;
			gap: 6px
		}

		.auto-op-network-method {
			font-size: 10px;
			font-weight: 700;
			padding: 2px 5px;
			border-radius: 3px;
			flex-shrink: 0;
			line-height: 1.3
		}

		.auto-op-network-method.get { background: var(--panel-active-border); color: #fff }
		.auto-op-network-method.post { background: var(--panel-waiting-text); color: #fff }
		.auto-op-network-method.put { background: var(--panel-highlight-border); color: #fff }
		.auto-op-network-method.delete { background: var(--panel-missing-border); color: #fff }
		.auto-op-network-method.patch { background: #9c27b0; color: #fff }
		.auto-op-network-method.xhr { background: #607d8b; color: #fff }

		.auto-op-network-url {
			font-size: 10px;
			color: var(--panel-text);
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			line-height: 1.3
		}

		.auto-op-network-status {
			font-size: 10px;
			font-weight: 700;
			flex-shrink: 0;
			line-height: 1.3
		}

		.auto-op-network-status.ok { color: var(--panel-active-border) }
		.auto-op-network-status.err { color: var(--panel-missing-border) }
		.auto-op-network-status.pending { color: var(--panel-label-text) }
		.auto-op-network-del-btn {
			flex-shrink: 0;
			width: 18px;
			height: 18px;
			border: none;
			background: transparent;
			color: var(--panel-label-text);
			cursor: pointer;
			font-size: 10px;
			border-radius: 3px;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0;
			transition: color 0.15s, background 0.15s
		}
		.auto-op-network-del-btn:hover {
			color: var(--panel-missing-border);
			background: rgba(244,67,71,0.1)
		}

		.auto-op-network-item-detail {
			display: none;
			margin-top: 6px;
			font-size: 10px;
			line-height: 1.5
		}

		.auto-op-network-item.expanded .auto-op-network-item-detail {
			display: block
		}

		.auto-op-network-detail-row {
			margin-bottom: 4px
		}

		.auto-op-network-detail-label {
			color: var(--panel-label-text);
			font-weight: 600;
			margin-right: 4px
		}

		.auto-op-network-detail-url {
			color: var(--panel-text);
			word-break: break-all;
			font-size: 10px;
			line-height: 1.4
		}

		.auto-op-network-detail-value {
			color: var(--panel-text);
			word-break: break-all;
			font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", "Consolas", monospace;
			font-size: 9px;
			background: var(--panel-input-bg);
			padding: 4px 6px;
			border-radius: 4px;
			margin-top: 2px;
			max-height: 120px;
			overflow-y: auto;
			white-space: pre-wrap
		}

		.auto-op-network-detail-copy {
			display: inline-block;
			font-size: 10px;
			color: var(--panel-button-text);
			cursor: pointer;
			font-weight: 600;
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			border-radius: 4px;
			padding: 3px 8px;
			font-family: var(--auto-op-font)
		}

		.auto-op-network-detail-copy:hover {
			background: var(--panel-button-hover-bg);
			color: var(--panel-button-hover-text)
		}

		#auto-op-power-save-overlay {
			position: fixed;
			inset: 0;
			background: #000;
			z-index: 2147483647;
			display: none;
			overflow: hidden
		}

		#auto-op-power-save-overlay.active {
			display: block
		}

		.ps-element {
			position: absolute;
			color: #333;
			font-family: var(--auto-op-font);
			font-variant-numeric: tabular-nums;
			font-weight: 700;
			transition: left 5s ease, top 5s ease;
			user-select: none;
			pointer-events: none
		}

		.ps-element.ps-time {
			font-size: 40px
		}

		.ps-element.ps-elapsed {
			font-size: 20px
		}

		.ps-element.ps-count {
			font-size: 20px
		}

		.ps-switch-area {
			position: absolute;
			transition: left 1s ease, top 1s ease;
			pointer-events: auto;
			width: 36px;
			height: 20px
		}

		.ps-switch-area .auto-op-switch {
			width: 36px;
			height: 20px;
			position: relative;
			display: block;
			cursor: pointer
		}

		.ps-switch-area .auto-op-switch input {
			position: absolute;
			width: 36px;
			height: 20px;
			opacity: 0;
			z-index: 1;
			cursor: pointer;
			margin: 0
		}

		.ps-switch-area .auto-op-switch-track {
			position: absolute;
			inset: 0;
			background: #111;
			border: 1px solid #333;
			border-radius: 10px;
			display: flex;
			align-items: center;
			cursor: pointer
		}

		.ps-switch-area .auto-op-switch-thumb {
			width: 14px;
			height: 14px;
			background: #444;
			border-radius: 50%;
			transition: transform 0.3s;
			pointer-events: none;
			transform: translateX(3px)
		}

		.ps-switch-area .auto-op-switch input:checked+.auto-op-switch-track {
			background: #333;
			border-color: #666
		}

		.ps-switch-area .auto-op-switch input:checked+.auto-op-switch-track .auto-op-switch-thumb {
			transform: translateX(18px);
			background: #777
		}

		.auto-op-info-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: var(--panel-bg);
			z-index: 5;
			display: none;
			flex-direction: column;
			border-radius: 0 0 12px 12px;
			overflow: hidden;
			transform: translateX(105%);
			transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
			will-change: transform
		}

		.auto-op-info-overlay.open {
			display: flex;
			transform: translateX(0)
		}

		.auto-op-info-panel-header {
			display: flex;
			align-items: center;
			padding: 14px;
			border-bottom: 1px solid var(--panel-border);
			flex-shrink: 0;
			line-height: 1.2;
			cursor: move;
			touch-action: none
		}

		.auto-op-info-back-btn {
			width: 28px;
			height: 28px;
			padding: 0;
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			color: var(--panel-button-text);
			font-size: 14px;
			font-weight: 700;
			font-family: var(--auto-op-font);
			cursor: pointer;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background 0.3s, color 0.3s, transform 0.15s ease;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-info-back-btn:hover {
			background: var(--panel-button-hover-bg);
			color: var(--panel-button-hover-text)
		}

		.auto-op-info-back-btn:active {
			transform: scale(0.96) !important
		}

		.auto-op-info-title {
			flex: 1;
			text-align: left;
			font-size: 13px;
			font-weight: 600;
			color: var(--panel-text);
			font-family: var(--auto-op-font);
			padding: 0 8px;
			overflow: hidden;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			word-break: break-all
		}

		.auto-op-info-content {
			flex: 1;
			padding: 14px;
			overflow-y: auto;
			color: var(--panel-label-text);
			font-size: 12px;
			font-family: var(--auto-op-font);
			display: flex;
			flex-direction: column;
			scrollbar-width: none;
			-ms-overflow-style: none
		}

		.auto-op-info-content::-webkit-scrollbar {
			display: none
		}

		.auto-op-info-empty {
			text-align: center;
			color: var(--panel-label-text);
			font-size: 13px;
			font-style: italic;
			padding: 14px
		}

		.auto-op-settings-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: var(--panel-bg);
			z-index: 5;
			display: none;
			flex-direction: column;
			border-radius: 0 0 12px 12px;
			overflow: hidden;
			transform: translateX(105%);
			transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
			will-change: transform
		}

		.auto-op-settings-overlay.open {
			display: flex;
			transform: translateX(0)
		}

		.auto-op-settings-panel-header {
			display: flex;
			align-items: center;
			padding: 14px;
			border-bottom: 1px solid var(--panel-border);
			flex-shrink: 0;
			line-height: 1.2;
			cursor: move;
			touch-action: none
		}

		.auto-op-settings-back-btn {
			width: 28px;
			height: 28px;
			padding: 0;
			background: var(--panel-button-bg);
			border: 1px solid var(--panel-button-border);
			color: var(--panel-button-text);
			font-size: 14px;
			font-weight: 700;
			font-family: var(--auto-op-font);
			cursor: pointer;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background 0.3s, color 0.3s, transform 0.15s ease;
			-webkit-tap-highlight-color: transparent;
			user-select: none
		}

		.auto-op-settings-back-btn:hover {
			background: var(--panel-button-hover-bg);
			color: var(--panel-button-hover-text)
		}

		.auto-op-settings-back-btn:active {
			transform: scale(0.96) !important
		}

		.auto-op-settings-title {
			flex: 1;
			text-align: left;
			font-size: 13px;
			font-weight: 600;
			color: var(--panel-text);
			font-family: var(--auto-op-font);
			padding: 0 8px;
			overflow: hidden;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			word-break: break-all
		}

		.auto-op-settings-content {
			flex: 1;
			padding: 14px;
			overflow-y: auto;
			color: var(--panel-label-text);
			font-size: 12px;
			font-family: var(--auto-op-font);
			display: flex;
			flex-direction: column;
			scrollbar-width: none;
			-ms-overflow-style: none
		}

		.auto-op-settings-content::-webkit-scrollbar {
			display: none
		}

		.auto-op-settings-empty {
			text-align: center;
			color: var(--panel-label-text);
			font-size: 13px;
			font-style: italic;
			padding: 14px
		}

		.auto-op-reset-btn {
			width: 100%;
			padding: 7px 10px;
			border: 1px solid var(--panel-missing-border);
			border-radius: 6px;
			font-size: 13px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			cursor: pointer;
			transition: all 0.3s;
			background: transparent;
			color: var(--panel-missing-text);
			margin-top: 12px;
			-webkit-tap-highlight-color: transparent;
			user-select: none;
			box-sizing: border-box
		}

		.auto-op-reset-btn:hover {
			background: var(--panel-missing-border);
			color: #fff
		}

		.auto-op-reset-btn:active {
			transform: scale(0.96) !important
		}

		.auto-op-reset-btn.confirm {
			background: var(--panel-missing-border);
			color: #fff;
			animation: auto-op-pulse 0.8s infinite !important
		}

		.auto-op-info-section {
			margin-bottom: 12px
		}

		.auto-op-info-section:last-child {
			margin-bottom: 0
		}

		.auto-op-info-row-switch {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			padding: 0;
			margin-bottom: 5px;
			gap: 2px;
			flex-wrap: wrap
		}

		.auto-op-info-row-switch .auto-op-switch {
			margin-left: auto
		}

		.auto-op-info-row-switch label:first-child {
			font-size: 11px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			color: var(--panel-label-text);
			letter-spacing: 0.5px
		}

		.auto-op-info-field {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			padding: 2px 0;
			gap: 2px
		}

		.auto-op-info-field-label {
			font-size: 11px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			color: var(--panel-label-text);
			flex-shrink: 0;
			max-width: 40%;
			word-break: break-all
		}

		.auto-op-info-field-value {
			font-size: 11px;
			font-family: var(--auto-op-font);
			color: var(--panel-text);
			word-break: break-all;
			text-align: right;
			flex: 1;
			min-width: 0
		}

		.auto-op-info-field input[type="text"],
		.auto-op-info-field input[type="number"] {
			flex: 0 1 65%;
			min-width: 0;
			max-width: 65%;
			margin-left: auto;
			background: var(--panel-input-bg) !important;
			border: 1px solid var(--panel-input-border) !important;
			border-radius: 4px;
			color: var(--panel-input-text) !important;
			padding: 4px 8px;
			font-size: 11px;
			font-family: var(--auto-op-font);
			outline: none
		}

		.auto-op-info-field input[type="text"]:focus,
		.auto-op-info-field input[type="number"]:focus {
			border-color: var(--panel-highlight-border) !important
		}

		.auto-op-info-field select {
			flex: 0 1 65%;
			min-width: 0;
			max-width: 65%;
			margin-left: auto;
			background: var(--panel-input-bg) !important;
			border: 1px solid var(--panel-input-border) !important;
			border-radius: 4px;
			color: var(--panel-input-text) !important;
			padding: 4px 6px;
			font-size: 11px;
			font-family: var(--auto-op-font);
			outline: none;
			cursor: pointer;
			-webkit-appearance: none;
			appearance: none
		}

		.auto-op-info-field select:focus {
			border-color: var(--panel-highlight-border) !important
		}

		.auto-op-info-field select option {
			background: var(--panel-input-bg) !important;
			color: var(--panel-input-text) !important
		}

		.auto-op-info-attrs-list {
			display: flex;
			flex-direction: column;
			gap: 0;
			margin-top: 0
		}

		.auto-op-info-attr-row {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			padding: 2px 0;
			gap: 2px
		}

		.auto-op-info-attr-row .auto-op-info-attr-key {
			font-size: 10px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			color: var(--panel-label-text);
			flex-shrink: 0;
			max-width: 40%;
			word-break: break-all;
			overflow: hidden;
			text-overflow: ellipsis
		}

		.auto-op-info-attr-row input[type="text"] {
			flex: 0 1 65%;
			min-width: 0;
			max-width: 65%;
			margin-left: auto;
			background: var(--panel-input-bg) !important;
			border: 1px solid var(--panel-input-border) !important;
			border-radius: 4px;
			color: var(--panel-input-text) !important;
			padding: 3px 6px;
			font-size: 10px;
			font-family: var(--auto-op-font);
			outline: none
		}

		.auto-op-info-attr-row input[type="text"]:focus {
			border-color: var(--panel-highlight-border) !important
		}

		.auto-op-target-item.disabled {
			border-color: var(--panel-label-text) !important;
			color: var(--panel-label-text) !important;
			opacity: 0.6
		}

		.auto-op-target-item.disabled span {
			color: var(--panel-label-text) !important
		}

		.auto-op-target-item.disabled .auto-op-target-parent {
			color: var(--panel-label-text) !important
		}

		.auto-op-test-btn {
			font-size: 10px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			padding: 2px 8px;
			border-radius: 4px;
			cursor: pointer;
			border: 1px solid var(--panel-button-border);
			background: var(--panel-button-bg);
			color: var(--panel-button-text);
			transition: all 0.3s;
			white-space: nowrap;
			flex-shrink: 0
		}

		.auto-op-test-btn:hover {
			background: var(--panel-highlight-border);
			color: #fff;
			border-color: var(--panel-highlight-border)
		}

		.auto-op-test-btn:active {
			transform: scale(0.92)
		}

		.auto-op-test-result {
			font-size: 10px;
			font-weight: 700;
			font-family: var(--auto-op-font);
			margin-left: 0;
			white-space: nowrap;
			flex-shrink: 0
		}

		.auto-op-test-result.pass {
			color: var(--panel-active-text)
		}

		.auto-op-test-result.fail {
			color: var(--panel-missing-text)
		}

		.auto-op-test-result.disabled {
			color: var(--panel-label-text)
		}

		.auto-op-test-css-result {
			font-size: 10px;
			font-weight: 700;
			font-family: var(--auto-op-font);
			margin-left: 0;
			white-space: nowrap
		}

		.auto-op-test-css-result.pass {
			color: var(--panel-active-text)
		}

		.auto-op-test-css-result.fail {
			color: var(--panel-missing-text)
		}

		.auto-op-test-css-result.disabled {
			color: var(--panel-label-text)
		}

		.auto-op-test-count {
			font-size: 10px;
			font-weight: 700;
			font-family: var(--auto-op-font);
			color: var(--panel-active-text);
			margin: 0;
			white-space: nowrap;
			flex-shrink: 0;
			min-width: 0;
			text-align: left
		}

		.auto-op-test-count.zero {
			color: var(--panel-missing-text)
		}

		.auto-op-test-highlight {
			outline: 2px dashed #F8BBD0 !important;
			outline-offset: -2px !important
		}

		.auto-op-font-failed {
			font-size: 10px;
			font-weight: 600;
			font-family: var(--auto-op-font);
			color: var(--panel-missing-text);
			margin-left: 6px;
			white-space: nowrap
		}

	`;
	document.head.appendChild(style);

	const DARK_CLS = ['dark', 'dark-mode', 'night', 'theme-dark', 'tw-dark', 'bp3-dark', 'chakra-ui-dark'];
	const LIGHT_CLS = ['light', 'light-mode', 'theme-light', 'tw-light'];

	function scanWebpageTheme(el) {
		if (!el) return null;
		for (const c of DARK_CLS) {
			if (el.classList.contains(c)) return 'dark';
		}
		for (const c of LIGHT_CLS) {
			if (el.classList.contains(c)) return 'light';
		}
		const st = el.getAttribute('style') || '';
		if (st.includes('color-scheme: dark')) return 'dark';
		if (st.includes('color-scheme: light')) return 'light';
		try {
			for (const attr of el.attributes) {
				const v = attr.value;
				if (!v) continue;
				if (v === 'dark' || v === 'dark-mode' || v === 'Dark') return 'dark';
				if (v === 'light' || v === 'light-mode' || v === 'Light') return 'light';
			}
		} catch (e) {}
		return null;
	}

	function getSystemTheme() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function resolveTheme() {
		switch (themeMode) {
			case 'light':
				return 'light';
			case 'dark':
				return 'dark';
			case 'system':
				return getSystemTheme();
			default: {
				const r = scanWebpageTheme(document.documentElement) || scanWebpageTheme(document.body);
				if (r === 'dark') return 'dark';
				if (r === 'light') return 'light';
				return getSystemTheme();
			}
		}
	}

	function applyTheme() {
		const theme = resolveTheme();
		isDarkMode = (theme === 'dark');
		document.documentElement.setAttribute('data-theme', theme);
	}
	let _themeTimer = null;

	function debouncedApplyTheme() {
		if (_themeTimer) return;
		_themeTimer = setTimeout(() => {
			_themeTimer = null;
			applyTheme();
		}, 200);
	}
	let _sysThemeListener = null,
		_htmlObserver = null,
		_bodyObserver = null;

	function startThemeWatchers() {
		stopThemeWatchers();
		if (themeMode === 'system' || themeMode === 'auto') {
			const mq = window.matchMedia('(prefers-color-scheme: dark)');
			mq.addEventListener('change', applyTheme);
			_sysThemeListener = {
				mq,
				fn: applyTheme
			};
		}
		if (themeMode === 'auto') {
			const h = document.documentElement;
			try {
				_htmlObserver = new MutationObserver(() => debouncedApplyTheme());
				_htmlObserver.observe(h, {
					attributes: true,
					attributeFilter: ['class', 'style']
				});
			} catch (e) {}
			if (document.body) {
				try {
					_bodyObserver = new MutationObserver(() => debouncedApplyTheme());
					_bodyObserver.observe(document.body, {
						attributes: true,
						attributeFilter: ['class', 'style']
					});
				} catch (e) {}
			}
		}
	}

	function stopThemeWatchers() {
		if (_sysThemeListener) {
			_sysThemeListener.mq.removeEventListener('change', _sysThemeListener.fn);
			_sysThemeListener = null;
		}
		if (_htmlObserver) {
			_htmlObserver.disconnect();
			_htmlObserver = null;
		}
		if (_bodyObserver) {
			_bodyObserver.disconnect();
			_bodyObserver = null;
		}
	}

	function detectBrowserTheme() {
		applyTheme();
		startThemeWatchers();
	}
	const panel = document.createElement('div');
	panel.id = 'auto-op-panel';
	panel.innerHTML = `
    <div class="auto-op-header">
      <button class="auto-op-toggle" title="收起/展开"><svg viewBox="0 0 1153.2 1153.2" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M768.1 135.1 V380.1 Q768.1 382.1 769.6 384.1 Q771.1 386.1 773.1 386.1 H1018.1 Q1034.1 386.1 1045.6 397.6 Q1057.1 409.1 1057.1 425.1 V462.1 Q1057.1 478.1 1045.6 490.1 Q1034.1 502.1 1018.1 502.1 H708.1 Q682.1 502.1 666.6 486.1 Q651.1 470.1 651.1 444.1 V135.1 Q651.1 119.1 663.1 107.6 Q675.1 96.1 691.1 96.1 H728.1 Q744.1 96.1 756.1 107.6 Q768.1 119.1 768.1 135.1 Z M502.1 709.1 V1018.1 Q502.1 1034.1 490.6 1045.6 Q479.1 1057.1 463.1 1057.1 H426.1 Q409.1 1057.1 397.6 1045.6 Q386.1 1034.1 386.1 1018.1 V774.1 Q386.1 768.1 380.1 768.1 H136.1 Q120.1 768.1 108.1 756.6 Q96.1 745.1 96.1 728.1 V691.1 Q96.1 675.1 107.6 663.6 Q119.1 652.1 136.1 652.1 H445.1 Q471.1 652.1 486.6 668.1 Q502.1 684.1 502.1 709.1 Z" transform="matrix(1 0 0 -1 0 1153.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
      <button class="auto-op-header-start" id="auto-op-btn-header-start" title="开始/停止"><svg viewBox="0 0 1202.4 1202.4" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M443.7 167.2 L902.7 433.2 Q970.7 471.2 999.2 492.7 Q1027.7 514.2 1040.7 543.2 Q1051.7 571.2 1051.7 602.2 Q1051.7 633.2 1040.7 661.2 Q1027.7 690.2 999.2 711.2 Q970.7 732.2 902.7 770.2 L443.7 1036.2 Q380.7 1073.2 346.2 1087.7 Q311.7 1102.2 279.7 1099.2 Q249.7 1096.2 223.2 1081.2 Q196.7 1066.2 178.7 1041.2 Q159.7 1016.2 155.2 980.7 Q150.7 945.2 150.7 868.2 V337.2 Q150.7 258.2 155.2 223.2 Q159.7 188.2 177.7 161.2 Q196.7 137.2 223.2 121.7 Q249.7 106.2 279.7 104.2 Q311.7 100.2 345.7 114.7 Q379.7 129.2 443.7 167.2 Z M272.7 231.2 Q269.7 236.2 268.7 262.7 Q267.7 289.2 267.7 337.2 V868.2 Q267.7 916.2 268.7 941.7 Q269.7 967.2 272.7 972.2 Q274.7 977.2 280.2 980.2 Q285.7 983.2 291.7 983.2 Q296.7 983.2 320.7 970.7 Q344.7 958.2 384.7 936.2 L845.7 670.2 Q884.7 647.2 906.7 633.2 Q928.7 619.2 932.7 613.2 Q938.7 602.2 933.7 591.2 Q929.7 584.2 912.2 573.2 Q894.7 562.2 845.7 533.2 L384.7 267.2 Q343.7 243.2 321.2 231.7 Q298.7 220.2 292.7 220.2 Q278.7 220.2 272.7 231.2 Z" transform="matrix(1 0 0 -1 0 1202.4)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
      <h3>自动操作</h3>
      <div class="auto-op-config-wrap">
        <button class="auto-op-config-btn" id="auto-op-config-btn" title="切换配置"><svg viewBox="0 0 1216.2 1216.2" fill="none" aria-hidden="true" style="width:20px;height:20px;display:inline-block"><path d="M1019.1 157.0 Q1069.5 181.2 1095.6 232.6 Q1108.8 258.7 1111.8 294.1 Q1114.8 329.5 1114.8 411.1 V805.1 Q1114.8 887.7 1111.8 923.1 Q1108.8 958.4 1095.6 984.6 Q1070.5 1034.0 1019.1 1060.1 Q993.9 1073.3 958.3 1076.3 Q922.6 1079.3 840.6 1079.3 H375.6 Q294.0 1079.3 258.1 1076.3 Q222.2 1073.3 197.1 1060.1 Q146.1 1035.0 120.5 984.6 Q107.3 958.4 104.3 923.1 Q101.3 887.7 101.3 805.1 V411.1 Q101.3 329.5 104.3 294.1 Q107.3 258.7 120.5 232.6 Q147.7 179.6 197.1 157.0 Q222.2 143.4 258.1 140.1 Q294.0 136.8 375.6 136.8 H840.6 Q922.6 136.8 958.3 140.1 Q993.9 143.4 1019.1 157.0 Z M249.1 255.1 Q229.1 267.0 219.6 285.6 Q214.8 295.4 213.8 312.9 Q212.8 330.4 212.8 362.1 V724.1 Q212.8 755.2 214.0 773.0 Q215.2 790.7 219.6 800.6 Q230.1 819.6 249.1 830.0 Q258.9 834.4 276.7 835.6 Q294.5 836.8 325.6 836.8 H889.6 Q921.7 836.8 939.0 835.8 Q956.2 834.8 966.1 830.0 Q984.7 820.6 996.5 800.6 Q1000.9 790.7 1002.1 773.0 Q1003.3 755.2 1003.3 724.1 V362.1 Q1003.3 330.4 1002.3 312.9 Q1001.3 295.4 996.5 285.6 Q985.7 266.0 966.1 255.1 Q956.2 250.3 939.0 249.3 Q921.7 248.3 889.6 248.3 H325.6 Q294.5 248.3 276.7 249.5 Q258.9 250.7 249.1 255.1 Z M597.3 370.9 H638.6 Q647.9 370.9 652.8 376.1 Q657.7 381.3 657.7 390.0 V697.1 Q657.7 706.4 652.8 711.3 Q647.9 716.2 638.6 716.2 H604.3 Q592.2 716.2 580.6 711.0 L515.6 677.2 Q501.1 670.0 501.1 654.5 V612.3 Q501.1 600.9 507.8 596.7 Q514.6 592.6 524.3 598.3 L578.2 626.6 V390.0 Q578.2 381.3 583.4 376.1 Q588.6 370.9 597.3 370.9 Z" transform="matrix(1 0 0 -1 0 1216.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
      </div>
    </div>
    <div class="auto-op-body">
      <div class="auto-op-page-selector">
        <button class="auto-op-page-btn active" data-page="0" title="操作"><svg viewBox="0 0 1197.6 1197.6" fill="none" aria-hidden="true" style="width:16px;height:16px;display:block"><path d="M988.8 161.3 Q1046.8 191.3 1073.8 246.3 Q1089.8 277.3 1093.8 319.8 Q1097.8 362.3 1097.8 459.3 V739.3 Q1097.8 836.3 1093.8 878.8 Q1089.8 921.3 1073.8 952.3 Q1045.8 1009.3 988.8 1037.3 Q957.8 1053.3 915.3 1057.3 Q872.8 1061.3 775.8 1061.3 H420.8 Q324.8 1061.3 282.3 1057.3 Q239.8 1053.3 207.8 1037.3 Q151.8 1009.3 123.8 952.3 Q107.8 921.3 103.8 878.8 Q99.8 836.3 99.8 739.3 V459.3 Q99.8 362.3 103.8 319.8 Q107.8 277.3 123.8 246.3 Q150.8 191.3 207.8 161.3 Q239.8 144.3 282.3 140.3 Q324.8 136.3 420.8 136.3 H775.8 Q872.8 136.3 915.3 140.3 Q957.8 144.3 988.8 161.3 Z M263.8 261.3 Q238.8 275.3 222.8 300.3 Q215.8 315.3 214.3 337.8 Q212.8 360.3 212.8 413.3 V785.3 Q212.8 839.3 214.3 860.8 Q215.8 882.3 222.8 897.3 Q237.8 924.3 263.8 937.3 Q277.8 944.3 299.8 945.8 Q321.8 947.3 376.8 947.3 H682.8 V251.3 H376.8 Q321.8 251.3 299.8 252.8 Q277.8 254.3 263.8 261.3 Z M796.8 947.3 H820.8 Q875.8 947.3 897.3 945.8 Q918.8 944.3 933.8 937.3 Q960.8 922.3 973.8 897.3 Q980.8 882.3 982.3 860.8 Q983.8 839.3 983.8 785.3 V413.3 Q983.8 359.3 982.3 337.3 Q980.8 315.3 973.8 300.3 Q960.8 277.3 933.8 261.3 Q918.8 254.3 897.3 252.8 Q875.8 251.3 820.8 251.3 H796.8 Z M420.8 769.3 V790.3 Q420.8 810.3 412.3 819.8 Q403.8 829.3 385.8 829.3 H310.8 Q291.8 829.3 283.3 819.8 Q274.8 810.3 274.8 790.3 V769.3 Q274.8 748.3 283.3 739.3 Q291.8 730.3 310.8 730.3 H385.8 Q403.8 730.3 412.3 739.3 Q420.8 748.3 420.8 769.3 Z M420.8 588.3 V609.3 Q420.8 629.3 412.3 638.8 Q403.8 648.3 385.8 648.3 H310.8 Q291.8 648.3 283.3 638.8 Q274.8 629.3 274.8 609.3 V588.3 Q274.8 567.3 283.3 558.3 Q291.8 549.3 310.8 549.3 H385.8 Q403.8 549.3 412.3 558.3 Q420.8 567.3 420.8 588.3 Z M626.8 769.3 V790.3 Q626.8 810.3 618.8 819.8 Q610.8 829.3 591.8 829.3 H515.8 Q497.8 829.3 489.3 819.8 Q480.8 810.3 480.8 790.3 V769.3 Q480.8 748.3 489.3 739.3 Q497.8 730.3 515.8 730.3 H591.8 Q610.8 730.3 618.8 739.3 Q626.8 748.3 626.8 769.3 Z M626.8 588.3 V609.3 Q626.8 629.3 618.8 638.8 Q610.8 648.3 591.8 648.3 H515.8 Q497.8 648.3 489.3 638.8 Q480.8 629.3 480.8 609.3 V588.3 Q480.8 567.3 489.3 558.3 Q497.8 549.3 515.8 549.3 H591.8 Q610.8 549.3 618.8 558.3 Q626.8 567.3 626.8 588.3 Z M420.8 407.3 V429.3 Q420.8 449.3 412.3 458.8 Q403.8 468.3 385.8 468.3 H310.8 Q291.8 468.3 283.3 458.8 Q274.8 449.3 274.8 429.3 V407.3 Q274.8 386.3 283.3 377.8 Q291.8 369.3 310.8 369.3 H385.8 Q403.8 369.3 412.3 377.8 Q420.8 386.3 420.8 407.3 Z" transform="matrix(1 0 0 -1 0 1197.6)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
        <button class="auto-op-page-btn" data-page="1" title="指令"><svg viewBox="0 0 1024 1024" fill="none" aria-hidden="true" style="width:16px;height:16px;display:block"><path d="M256 192 L576 448 Q608 480 608 512 Q608 544 576 576 L256 832 Q224 864 192 832 L160 800 Q128 768 160 736 L416 512 L160 288 Q128 256 160 224 L192 192 Q224 160 256 192 Z M640 832 L864 832 Q896 832 896 800 L896 768 Q896 736 864 736 L640 736 Q608 736 608 768 L608 800 Q608 832 640 832 Z" fill="currentColor" fill-rule="nonzero"></path></svg></button>
        <button class="auto-op-page-btn" data-page="2" title="参数"><svg viewBox="0 0 1173.6 1173.6" fill="none" aria-hidden="true" style="width:16px;height:16px;display:block"><path d="M1075.8 939.3 V968.3 Q1075.8 989.3 1062.8 999.8 Q1049.8 1010.3 1030.8 1010.3 H398.8 Q379.8 1010.3 367.3 999.3 Q354.8 988.3 354.8 969.3 V940.3 Q354.8 919.3 367.3 908.3 Q379.8 897.3 398.8 897.3 H1030.8 Q1049.8 897.3 1062.8 907.8 Q1075.8 918.3 1075.8 939.3 Z M230.8 138.3 Q253.8 149.3 264.8 172.3 Q267.8 180.3 268.3 191.8 Q268.8 203.3 268.8 219.3 Q268.8 256.3 264.8 266.3 Q254.8 290.3 230.8 299.3 Q222.8 302.3 211.3 303.3 Q199.8 304.3 183.8 304.3 Q167.8 304.3 155.8 303.3 Q143.8 302.3 135.8 299.3 Q112.8 289.3 103.8 267.3 Q99.8 259.3 98.8 247.3 Q97.8 235.3 97.8 219.3 Q97.8 203.3 98.8 191.3 Q99.8 179.3 103.8 171.3 Q112.8 149.3 135.8 138.3 Q143.8 135.3 155.8 134.8 Q167.8 134.3 183.8 134.3 Q199.8 134.3 211.3 134.8 Q222.8 135.3 230.8 138.3 Z M230.8 506.3 Q253.8 518.3 264.8 541.3 Q267.8 548.3 268.3 560.3 Q268.8 572.3 268.8 587.3 Q268.8 618.3 264.8 633.3 Q252.8 657.3 231.8 666.3 Q223.8 670.3 211.8 671.3 Q199.8 672.3 183.8 672.3 Q167.8 672.3 155.3 671.3 Q142.8 670.3 134.8 666.3 Q112.8 656.3 103.8 634.3 Q99.8 626.3 98.8 614.8 Q97.8 603.3 97.8 587.3 Q97.8 571.3 98.8 559.8 Q99.8 548.3 103.8 540.3 Q112.8 517.3 135.8 506.3 Q143.8 503.3 155.8 502.8 Q167.8 502.3 183.8 502.3 Q199.8 502.3 211.3 502.8 Q222.8 503.3 230.8 506.3 Z M1075.8 205.3 V234.3 Q1075.8 255.3 1062.8 265.8 Q1049.8 276.3 1030.8 276.3 H398.8 Q379.8 276.3 367.3 265.3 Q354.8 254.3 354.8 235.3 V206.3 Q354.8 185.3 367.3 174.3 Q379.8 163.3 398.8 163.3 H1030.8 Q1049.8 163.3 1062.8 173.8 Q1075.8 184.3 1075.8 205.3 Z M230.8 873.3 Q254.8 883.3 264.8 907.3 Q268.8 917.3 268.8 954.3 Q268.8 970.3 268.3 981.8 Q267.8 993.3 264.8 1001.3 Q253.8 1024.3 230.8 1035.3 Q222.8 1038.3 211.3 1038.8 Q199.8 1039.3 183.8 1039.3 Q167.8 1039.3 155.8 1038.8 Q143.8 1038.3 135.8 1035.3 Q112.8 1024.3 103.8 1002.3 Q99.8 994.3 98.8 982.3 Q97.8 970.3 97.8 954.3 Q97.8 938.3 98.8 926.3 Q99.8 914.3 103.8 906.3 Q112.8 885.3 135.8 873.3 Q143.8 870.3 155.8 869.8 Q167.8 869.3 183.8 869.3 Q199.8 869.3 211.3 869.8 Q222.8 870.3 230.8 873.3 Z M1075.8 572.3 V601.3 Q1075.8 622.3 1062.8 632.8 Q1049.8 643.3 1030.8 643.3 H398.8 Q379.8 643.3 367.3 632.3 Q354.8 621.3 354.8 602.3 V573.3 Q354.8 552.3 367.3 541.3 Q379.8 530.3 398.8 530.3 H1030.8 Q1049.8 530.3 1062.8 540.8 Q1075.8 551.3 1075.8 572.3 Z" transform="matrix(1 0 0 -1 0 1173.6)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
        <button class="auto-op-page-btn" data-page="3" title="自动刷新"><svg viewBox="0 0 1300.8 1300.8" fill="none" aria-hidden="true" style="width:16px;height:16px;display:block"><path d="M1036.9 289.4 Q1110.9 367.4 1147.9 467.4 Q1184.9 567.4 1181.9 668.4 Q1178.9 769.4 1137.9 851.4 Q1129.9 869.4 1114.9 872.9 Q1099.9 876.4 1087.9 864.4 L1055.9 836.4 Q1041.9 824.4 1040.4 814.4 Q1038.9 804.4 1042.9 790.4 Q1069.9 726.4 1069.9 651.4 Q1069.9 576.4 1041.4 501.9 Q1012.9 427.4 954.9 367.4 Q877.9 286.4 772.4 256.4 Q666.9 226.4 560.9 251.4 Q454.9 276.4 373.9 353.4 Q292.9 430.4 262.4 535.9 Q231.9 641.4 257.4 747.9 Q282.9 854.4 359.9 935.4 Q430.9 1008.4 525.4 1039.9 Q619.9 1071.4 717.9 1056.9 Q815.9 1042.4 896.9 983.4 L678.9 754.4 Q675.9 751.4 672.9 752.4 Q667.9 753.4 655.9 753.4 Q612.9 751.4 583.4 720.9 Q553.9 690.4 554.9 647.4 Q556.9 605.4 587.4 576.9 Q617.9 548.4 660.9 549.4 Q702.9 550.4 731.9 580.9 Q760.9 611.4 759.9 653.4 Q759.9 664.4 757.9 670.4 Q756.9 674.4 758.9 676.4 L1031.9 962.4 Q1043.9 974.4 1043.4 989.4 Q1042.9 1004.4 1032.9 1016.4 L1018.9 1030.4 Q915.9 1128.4 779.9 1160.4 Q643.9 1192.4 509.9 1153.4 Q375.9 1114.4 277.9 1011.4 Q179.9 908.4 147.9 772.9 Q115.9 637.4 154.4 503.4 Q192.9 369.4 296.9 271.4 Q399.9 173.4 535.9 140.9 Q671.9 108.4 805.9 146.9 Q939.9 185.4 1036.9 289.4 Z" transform="matrix(1 0 0 -1 0 1300.8)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
        <button class="auto-op-page-btn" data-page="4" title="系统设置"><svg viewBox="0 0 1274.4 1274.4" fill="none" aria-hidden="true" style="width:16px;height:16px;display:block"><path d="M664.2 112.2 Q675.2 114.2 689.2 120.7 Q703.2 127.2 719.2 136.2 L737.2 146.2 L1018.2 304.2 Q1049.2 321.2 1063.2 330.7 Q1077.2 340.2 1087.2 351.2 Q1106.2 371.2 1115.2 399.2 Q1120.2 413.2 1121.2 429.7 Q1122.2 446.2 1122.2 482.2 V791.2 Q1122.2 827.2 1121.2 843.2 Q1120.2 859.2 1115.2 873.2 Q1106.2 900.2 1087.2 922.2 Q1079.2 932.2 1066.2 940.2 Q1053.2 948.2 1030.2 961.2 L1018.2 968.2 L737.2 1127.2 Q706.2 1145.2 692.2 1151.7 Q678.2 1158.2 664.2 1160.2 Q637.2 1168.2 610.2 1160.2 Q596.2 1158.2 582.2 1151.7 Q568.2 1145.2 537.2 1127.2 L256.2 968.2 Q247.2 963.2 237.2 957.2 Q221.2 948.2 207.7 939.7 Q194.2 931.2 187.2 922.2 Q168.2 900.2 159.2 873.2 Q154.2 859.2 153.2 843.2 Q152.2 827.2 152.2 791.2 V482.2 Q152.2 446.2 153.2 429.7 Q154.2 413.2 159.2 399.2 Q168.2 371.2 187.2 351.2 Q196.2 341.2 209.2 332.2 Q222.2 323.2 245.2 310.2 L256.2 304.2 L537.2 146.2 L555.2 136.2 Q571.2 127.2 585.2 120.7 Q599.2 114.2 610.2 112.2 Q637.2 106.2 664.2 112.2 Z M266.2 457.2 V821.2 Q266.2 834.2 270.7 842.2 Q275.2 850.2 287.2 856.2 L612.2 1039.2 Q628.2 1048.2 636.7 1048.7 Q645.2 1049.2 659.2 1041.2 L977.2 862.2 Q999.2 850.2 1004.2 841.2 Q1009.2 832.2 1009.2 807.2 V458.2 Q1009.2 443.2 1005.7 434.7 Q1002.2 426.2 992.2 420.2 L663.2 233.2 Q646.2 224.2 636.7 224.2 Q627.2 224.2 611.2 234.2 L290.2 415.2 Q275.2 423.2 270.7 431.2 Q266.2 439.2 266.2 457.2 Z M851.2 636.2 Q851.2 694.2 822.2 743.2 Q793.2 792.2 744.2 821.2 Q695.2 850.2 637.2 850.2 Q579.2 850.2 530.2 821.7 Q481.2 793.2 452.2 743.7 Q423.2 694.2 423.2 636.2 Q423.2 578.2 452.2 529.2 Q481.2 480.2 530.2 451.2 Q579.2 422.2 637.2 422.2 Q695.2 422.2 744.7 451.2 Q794.2 480.2 822.7 529.2 Q851.2 578.2 851.2 636.2 Z M539.2 636.2 Q539.2 677.2 567.7 705.7 Q596.2 734.2 637.2 734.2 Q678.2 734.2 706.7 705.7 Q735.2 677.2 735.2 636.2 Q735.2 595.2 706.7 566.7 Q678.2 538.2 637.2 538.2 Q596.2 538.2 567.7 566.7 Q539.2 595.2 539.2 636.2 Z" transform="matrix(1 0 0 -1 0 1274.4)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
      </div>
      <div class="auto-op-page-container" id="auto-op-page-container">
        <div class="auto-op-page active" data-page="0">
          <div class="auto-op-row-switch">
            <label>多选模式</label>
            <label class="auto-op-switch"><input type="checkbox" id="auto-op-multi-mode"><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label>
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
        </div>
        <div class="auto-op-page" data-page="1">
          <div class="auto-op-row">
            <label>JavaScript 指令</label>
            <textarea id="auto-op-cmd-input" class="auto-op-cmd-input" placeholder="输入 JavaScript 代码...&#10;可用变量：$el(当前元素) $targets(所有目标) $config(当前配置)" rows="4"></textarea>
          </div>
          <div class="auto-op-row auto-op-cmd-presets">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
              <label style="margin-bottom:0;">快捷指令</label>
              <button class="auto-op-network-btn" id="auto-op-btn-network-monitor" title="网络监测器"><svg viewBox="0 0 1245.6 1245.6" fill="none" aria-hidden="true" style="width:15px;height:15px;display:block"><path d="M472.8 215.8 V245.8 Q472.8 267.8 460.8 278.8 Q448.8 289.8 427.8 289.8 H411.8 Q369.8 289.8 350.3 291.3 Q330.8 292.8 316.8 299.8 Q288.8 315.8 274.8 341.8 Q268.8 355.8 267.3 376.8 Q265.8 397.8 265.8 450.8 V867.8 Q265.8 920.8 267.3 941.8 Q268.8 962.8 274.8 976.8 Q290.8 1004.8 316.8 1018.8 Q331.8 1025.8 352.8 1027.3 Q373.8 1028.8 425.8 1028.8 H706.8 Q759.8 1028.8 780.3 1027.3 Q800.8 1025.8 815.8 1018.8 Q843.8 1003.8 855.8 976.8 Q863.8 962.8 865.3 941.8 Q866.8 920.8 866.8 867.8 V756.8 Q866.8 736.8 878.8 725.3 Q890.8 713.8 910.8 713.8 H937.8 Q956.8 713.8 968.8 725.3 Q980.8 736.8 980.8 756.8 V824.8 Q980.8 918.8 977.3 959.8 Q973.8 1000.8 957.8 1030.8 Q927.8 1090.8 868.8 1119.8 Q839.8 1134.8 798.3 1138.3 Q756.8 1141.8 662.8 1141.8 H469.8 Q375.8 1141.8 334.3 1138.3 Q292.8 1134.8 263.8 1119.8 Q205.8 1091.8 173.8 1030.8 Q158.8 1000.8 155.3 959.8 Q151.8 918.8 151.8 824.8 V459.8 Q151.8 394.8 153.3 365.8 Q154.8 336.8 162.8 313.8 Q177.8 269.8 211.8 236.3 Q245.8 202.8 289.8 187.8 Q312.8 179.8 343.8 177.8 Q374.8 175.8 432.8 176.8 Q448.8 176.8 460.8 188.8 Q472.8 200.8 472.8 215.8 Z M753.8 658.8 V684.8 Q753.8 705.8 741.8 715.8 Q729.8 725.8 707.8 725.8 H424.8 Q399.8 725.8 389.3 715.3 Q378.8 704.8 378.8 682.8 V658.8 Q378.8 636.8 389.8 626.3 Q400.8 615.8 424.8 615.8 H707.8 Q730.8 615.8 742.3 626.3 Q753.8 636.8 753.8 658.8 Z M753.8 852.8 V878.8 Q753.8 899.8 741.8 909.8 Q729.8 919.8 707.8 919.8 H424.8 Q399.8 919.8 389.3 909.3 Q378.8 898.8 378.8 876.8 V852.8 Q378.8 830.8 389.8 820.3 Q400.8 809.8 424.8 809.8 H707.8 Q730.8 809.8 742.3 820.3 Q753.8 830.8 753.8 852.8 Z M626.8 233.8 L758.8 116.8 Q773.8 103.8 789.3 104.3 Q804.8 104.8 814.3 116.3 Q823.8 127.8 823.8 145.8 V199.8 H1054.8 Q1070.8 199.8 1081.8 209.8 Q1092.8 219.8 1092.8 240.8 V264.8 Q1092.8 285.8 1082.3 295.8 Q1071.8 305.8 1054.8 305.8 H649.8 Q629.8 305.8 617.8 294.8 Q605.8 283.8 607.3 266.8 Q608.8 249.8 626.8 233.8 Z M1071.8 451.8 L939.8 568.8 Q924.8 581.8 909.8 581.3 Q894.8 580.8 885.3 569.3 Q875.8 557.8 875.8 539.8 V485.8 H644.8 Q628.8 485.8 617.8 476.3 Q606.8 466.8 606.8 444.8 V420.8 Q606.8 399.8 617.3 389.8 Q627.8 379.8 644.8 379.8 H1049.8 Q1069.8 379.8 1081.8 391.3 Q1093.8 402.8 1091.8 419.3 Q1089.8 435.8 1071.8 451.8 Z" transform="matrix(1 0 0 -1 0 1245.6)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
            </div>
            <select id="auto-op-cmd-preset">
              <option value="">选择预设指令...</option>
              <option value="$el.click()">点击元素</option>
              <option value="$el.scrollIntoView({behavior:'smooth',block:'center'})">滚动到元素</option>
              <option value="$el.value = ''; $el.dispatchEvent(new Event('input',{bubbles:true})); $el.dispatchEvent(new Event('change',{bubbles:true}))">清空输入框</option>
              <option value="console.log('元素信息:',{tag:$el.tagName,id:$el.id,class:$el.className,text:$el.textContent?.trim().slice(0,200),value:$el.value,rect:$el.getBoundingClientRect(),attrs:[...$el.attributes].map(a=>a.name+'='+a.value).join('; ')})">显示元素信息</option>
              <option value="console.log($el.textContent)">打印元素文本</option>
              <option value="$el.style.display = 'none'">隐藏元素</option>
              <option value="$el.style.display = ''">显示元素</option>
              <option value="$el.remove()">删除元素</option>
              <option value="fetch(location.href).then(r=>r.text()).then(console.log)">GET 当前页面</option>
              <option value="fetch('/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'value'})}).then(r=>r.json()).then(console.log)">POST JSON</option>
              <option value="(()=>{var el=$el,tag=el.tagName,id=el.id?'#'+el.id:'',cls=el.className?'.'+el.className.trim().split(/\\s+/).slice(0,3).join('.'):'',desc=tag+id+cls,inline=el.onclick,report=[];console.log('元素:',desc,el);if(inline){console.log('内联onclick:',inline.toString().slice(0,200));report.push('内联onclick')}var orig=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(type,fn,opt){if(type==='click'){console.log('click监听:',fn.toString().slice(0,200));report.push(fn.toString().slice(0,100))}return orig.call(this,type,fn,opt)};try{el.dispatchEvent(new Event('click',{bubbles:true}))}finally{EventTarget.prototype.addEventListener=orig}console.log('触发完成，共 '+report.length+' 个处理器:',report)})()">触发点击事件</option>
            </select>
          </div>
          <div class="auto-op-row auto-op-cmd-btns">
            <button class="auto-op-btn-cmd-test" id="auto-op-btn-cmd-test">测试运行</button>
            <button class="auto-op-btn-cmd-target" id="auto-op-btn-cmd-target" disabled>设为目标</button>
          </div>
          <div class="auto-op-row">
            <div class="auto-op-log-header"><label>输出</label><button class="auto-op-btn-clear" id="auto-op-btn-clear-cmd-output2">清空</button></div>
            <div class="auto-op-cmd-output" id="auto-op-cmd-output">
              <div class="auto-op-cmd-output-empty">等待指令执行...</div>
            </div>
          </div>
        </div>
        <div class="auto-op-page" data-page="2">
          <div class="auto-op-row"><label>操作次数</label><input type="number" id="auto-op-max-clicks" min="0" placeholder="留空为无限"></div>
          <div class="auto-op-row"><label>操作时间 (min)</label><input type="number" id="auto-op-max-duration" min="0" step="0.0001" placeholder="留空为无限 支持小数"></div>
          <div class="auto-op-row"><div class="auto-op-label-with-countdown"><label style="margin-bottom:0;">自动启动 (min)</label><span class="auto-op-autostart-countdown" id="auto-op-autostart-countdown"></span></div><input type="number" id="auto-op-autostart-interval" min="0" step="0.0001" placeholder="留空为关闭 支持小数"></div>
          <div class="auto-op-row"><label>操作间隔 (ms)</label><input type="number" id="auto-op-click-interval" min="1" placeholder="1000" value="1000"></div>
          <div class="auto-op-row"><label>元素消失后</label><select id="auto-op-missing-action"><option value="wait">等待重试（自动继续）</option><option value="stop">立即停止</option></select></div>
        </div>
        <div class="auto-op-page" data-page="3">
          <div class="auto-op-row-switch"><label>自动刷新网页</label><label class="auto-op-switch"><input type="checkbox" id="auto-op-auto-refresh"><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div>
          <div class="auto-op-row" id="auto-op-refresh-interval-row"><label>刷新间隔 (s) 范围：10 ~ 86400</label><input type="number" id="auto-op-refresh-interval" min="10" max="86400" placeholder="60" value="60"></div>
          <div class="auto-op-row"><div class="auto-op-log-header"><label>刷新日志</label><button class="auto-op-btn-clear" id="auto-op-btn-clear-log">清空</button></div><div class="auto-op-log-container" id="auto-op-log-container"><div class="auto-op-log-empty">暂无日志</div></div></div>
        </div>
        <div class="auto-op-page" data-page="4">
          <div class="auto-op-row-switch"><label>选取元素放行点击</label><label class="auto-op-switch"><input type="checkbox" id="auto-op-pick-pass-through"><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div>
          <div class="auto-op-row-switch"><label>省电模式</label><label class="auto-op-switch"><input type="checkbox" id="auto-op-power-save"><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div>
          <div class="auto-op-row-switch"><label>屏幕常亮</label><label class="auto-op-switch"><input type="checkbox" id="auto-op-wake-lock"><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div>
          <div class="auto-op-row-switch"><label>禁止聚焦</label><label class="auto-op-switch"><input type="checkbox" id="auto-op-suppress-focus"><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div>
          <div class="auto-op-row"><label>亮暗模式</label><select id="auto-op-theme-mode"><option value="auto">跟随网页</option><option value="system">跟随系统</option><option value="light">亮色模式</option><option value="dark">暗色模式</option></select></div>
          <div class="auto-op-row"><label>面板字体</label><select id="auto-op-panel-font"><option value="MiSans VF">MiSans VF</option><option value="system-ui">system-ui</option></select><span class="auto-op-font-failed" id="auto-op-font-failed" style="display:none">MiSans VF 加载失败</span></div>
          <button class="auto-op-reset-btn" id="auto-op-reset-btn" style="display:none;">恢复默认设置</button>
        </div>
      </div>
      <div id="auto-op-refresh-progress" style="display: none;">
        <div class="auto-op-progress-info"><span class="auto-op-progress-percent" id="auto-op-refresh-percent">0%</span><span class="auto-op-progress-time" id="auto-op-refresh-time">剩余 --:--</span></div>
        <div class="auto-op-progress-container"><div class="auto-op-progress-fill" id="auto-op-progress-fill"></div></div>
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
          <div class="auto-op-modal-btns"><button class="auto-op-modal-btn auto-op-modal-cancel" id="auto-op-modal-cancel">取消</button><button class="auto-op-modal-btn auto-op-modal-ok" id="auto-op-modal-ok">确定</button></div>
        </div>
      </div>
    </div>
  `;
	document.body.appendChild(panel);
	const infoOverlay = document.createElement('div');
	infoOverlay.className = 'auto-op-info-overlay';
	infoOverlay.id = 'auto-op-info-overlay';
	infoOverlay.innerHTML = `
    <div class="auto-op-info-panel-header">
      <button class="auto-op-info-back-btn" id="auto-op-info-back-btn"><svg viewBox="0 0 1375.2 1375.2" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M321.6 626.1 H1210.6 Q1233.6 626.1 1247.1 639.1 Q1260.6 652.1 1260.6 675.1 V702.1 Q1260.6 723.1 1247.1 735.6 Q1233.6 748.1 1210.6 748.1 H321.6 L574.6 1001.1 Q590.6 1016.1 590.6 1033.6 Q590.6 1051.1 572.6 1069.1 L556.6 1086.1 Q539.6 1104.1 521.6 1103.6 Q503.6 1103.1 486.6 1086.1 L139.6 738.1 Q115.6 714.1 115.1 687.1 Q114.6 660.1 140.6 635.1 L486.6 289.1 Q503.6 272.1 520.6 271.6 Q537.6 271.1 555.6 289.1 L574.6 308.1 Q591.6 324.1 591.6 340.6 Q591.6 357.1 573.6 374.1 Z" transform="matrix(1 0 0 -1 0 1375.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
      <span class="auto-op-info-title" id="auto-op-info-title">元素详情</span>
    </div>
    <div class="auto-op-info-content" id="auto-op-info-content">
      <span class="auto-op-info-empty">暂无详情信息</span>
    </div>
  `;
	panel.appendChild(infoOverlay);
	const settingsOverlay = document.createElement('div');
	settingsOverlay.className = 'auto-op-settings-overlay';
	settingsOverlay.id = 'auto-op-settings-overlay';
	settingsOverlay.innerHTML = `
    <div class="auto-op-settings-panel-header">
      <button class="auto-op-settings-back-btn" id="auto-op-settings-back-btn"><svg viewBox="0 0 1375.2 1375.2" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M321.6 626.1 H1210.6 Q1233.6 626.1 1247.1 639.1 Q1260.6 652.1 1260.6 675.1 V702.1 Q1260.6 723.1 1247.1 735.6 Q1233.6 748.1 1210.6 748.1 H321.6 L574.6 1001.1 Q590.6 1016.1 590.6 1033.6 Q590.6 1051.1 572.6 1069.1 L556.6 1086.1 Q539.6 1104.1 521.6 1103.6 Q503.6 1103.1 486.6 1086.1 L139.6 738.1 Q115.6 714.1 115.1 687.1 Q114.6 660.1 140.6 635.1 L486.6 289.1 Q503.6 272.1 520.6 271.6 Q537.6 271.1 555.6 289.1 L574.6 308.1 Q591.6 324.1 591.6 340.6 Q591.6 357.1 573.6 374.1 Z" transform="matrix(1 0 0 -1 0 1375.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
      <span class="auto-op-settings-title" id="auto-op-settings-title">元素设置</span>
    </div>
    <div class="auto-op-settings-content" id="auto-op-settings-content">
      <span class="auto-op-settings-empty">暂无设置项</span>
    </div>
  `;
	panel.appendChild(settingsOverlay);
	const networkOverlay = document.createElement('div');
	networkOverlay.className = 'auto-op-network-overlay';
	networkOverlay.id = 'auto-op-network-overlay';
	networkOverlay.innerHTML = `
    <div class="auto-op-network-header">
      <button class="auto-op-network-back-btn" id="auto-op-network-back-btn"><svg viewBox="0 0 1375.2 1375.2" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M321.6 626.1 H1210.6 Q1233.6 626.1 1247.1 639.1 Q1260.6 652.1 1260.6 675.1 V702.1 Q1260.6 723.1 1247.1 735.6 Q1233.6 748.1 1210.6 748.1 H321.6 L574.6 1001.1 Q590.6 1016.1 590.6 1033.6 Q590.6 1051.1 572.6 1069.1 L556.6 1086.1 Q539.6 1104.1 521.6 1103.6 Q503.6 1103.1 486.6 1086.1 L139.6 738.1 Q115.6 714.1 115.1 687.1 Q114.6 660.1 140.6 635.1 L486.6 289.1 Q503.6 272.1 520.6 271.6 Q537.6 271.1 555.6 289.1 L574.6 308.1 Q591.6 324.1 591.6 340.6 Q591.6 357.1 573.6 374.1 Z" transform="matrix(1 0 0 -1 0 1375.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button>
      <span class="auto-op-network-title">网络监测器</span>
      <div class="auto-op-network-header-right">
        <span class="auto-op-network-count" id="auto-op-network-count">0</span>
        <label class="auto-op-switch"><input type="checkbox" id="auto-op-network-toggle"><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label>
      </div>
    </div>
    <div class="auto-op-network-toolbar">
      <button class="auto-op-btn-clear" id="auto-op-btn-clear-network">清空</button>
      <button class="auto-op-btn-clear" id="auto-op-btn-copy-all-network">复制全部</button>
    </div>
    <div class="auto-op-network-content" id="auto-op-network-content">
      <span class="auto-op-network-empty">未监测到请求</span>
    </div>
  `;
	panel.appendChild(networkOverlay);
	const powerSaveOverlay = document.createElement('div');
	powerSaveOverlay.id = 'auto-op-power-save-overlay';
	powerSaveOverlay.innerHTML = `
    <div class="ps-element ps-time" id="ps-time"></div>
    <div class="ps-element ps-elapsed" id="ps-elapsed"></div>
    <div class="ps-element ps-count" id="ps-count"></div>
    <div class="ps-switch-area" id="ps-switch-area">
      <label class="auto-op-switch"><input type="checkbox" checked id="ps-switch"><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label>
    </div>
  `;
	document.body.appendChild(powerSaveOverlay);
	const configMenuEl = document.createElement('div');
	configMenuEl.className = 'auto-op-config-menu';
	document.body.appendChild(configMenuEl);
	const targetListContainer = document.getElementById('auto-op-target-list-container'),
		maxClicksInput = document.getElementById('auto-op-max-clicks'),
		clickIntervalInput = document.getElementById('auto-op-click-interval'),
		missingActionSelect = document.getElementById('auto-op-missing-action'),
		btnPick = document.getElementById('auto-op-btn-pick'),
		btnStart = document.getElementById('auto-op-btn-start'),
		statusDiv = document.getElementById('auto-op-status'),
		countSpan = document.getElementById('auto-op-count'),
		stateSpan = document.getElementById('auto-op-state'),
		toggleBtn = panel.querySelector('.auto-op-toggle'),
		dragHandle = panel.querySelector('.auto-op-header'),
		btnClearAll = document.getElementById('auto-op-btn-clear-all'),
		targetCountSpan = document.getElementById('auto-op-target-count'),
		multiModeCheckbox = document.getElementById('auto-op-multi-mode'),
		strategyRow = document.getElementById('auto-op-strategy-row'),
		strategySelect = document.getElementById('auto-op-click-strategy'),
		btnHeaderStart = document.getElementById('auto-op-btn-header-start'),
		pageContainer = document.getElementById('auto-op-page-container'),
		pageButtons = panel.querySelectorAll('.auto-op-page-selector .auto-op-page-btn'),
		autoRefreshCheckbox = document.getElementById('auto-op-auto-refresh'),
		refreshIntervalInput = document.getElementById('auto-op-refresh-interval'),
		refreshProgressDiv = document.getElementById('auto-op-refresh-progress'),
		refreshPercentSpan = document.getElementById('auto-op-refresh-percent'),
		refreshTimeSpan = document.getElementById('auto-op-refresh-time'),
		refreshProgressFill = document.getElementById('auto-op-progress-fill'),
		logContainer = document.getElementById('auto-op-log-container'),
		btnClearLog = document.getElementById('auto-op-btn-clear-log'),
		maxDurationInput = document.getElementById('auto-op-max-duration'),
		autoStartIntervalInput = document.getElementById('auto-op-autostart-interval'),
		autoStartCountdownLabel = document.getElementById('auto-op-autostart-countdown'),
		elapsedSpan = document.getElementById('auto-op-elapsed'),
		configBtnEl = document.getElementById('auto-op-config-btn');
	const powerSaveCheckbox = document.getElementById('auto-op-power-save');
	const psTimeEl = document.getElementById('ps-time');
	const psElapsedEl = document.getElementById('ps-elapsed');
	const psCountEl = document.getElementById('ps-count');
	const psSwitchWrapEl = document.getElementById('ps-switch-area');
	const psSwitchEl = document.getElementById('ps-switch');
	const wakeLockCheckbox = document.getElementById('auto-op-wake-lock');
	const suppressFocusCheckbox = document.getElementById('auto-op-suppress-focus');
	const pickPassThroughCheckbox = document.getElementById('auto-op-pick-pass-through');
	const panelFontSelect = document.getElementById('auto-op-panel-font');
	const themeModeSelect = document.getElementById('auto-op-theme-mode');
	const infoOverlayEl = document.getElementById('auto-op-info-overlay');
	const infoTitleEl = document.getElementById('auto-op-info-title');
	const infoContentEl = document.getElementById('auto-op-info-content');
	const infoBackBtn = document.getElementById('auto-op-info-back-btn');
	const settingsOverlayEl = document.getElementById('auto-op-settings-overlay');
	const settingsTitleEl = document.getElementById('auto-op-settings-title');
	const settingsContentEl = document.getElementById('auto-op-settings-content');
	const settingsBackBtn = document.getElementById('auto-op-settings-back-btn');
	const resetBtn = document.getElementById('auto-op-reset-btn');
	const cmdInput = document.getElementById('auto-op-cmd-input');
	const cmdOutput = document.getElementById('auto-op-cmd-output');
	const cmdTestBtn = document.getElementById('auto-op-btn-cmd-test');
	const cmdTargetBtn = document.getElementById('auto-op-btn-cmd-target');
	const cmdClearOutputBtn2 = document.getElementById('auto-op-btn-clear-cmd-output2');
	const cmdPresetSelect = document.getElementById('auto-op-cmd-preset');
	const networkOverlayEl = document.getElementById('auto-op-network-overlay');
	const networkContentEl = document.getElementById('auto-op-network-content');
	const networkCountSpan = document.getElementById('auto-op-network-count');
	const networkToggle = document.getElementById('auto-op-network-toggle');
	const networkBackBtn = document.getElementById('auto-op-network-back-btn');
	const btnNetworkMonitor = document.getElementById('auto-op-btn-network-monitor');
	const btnClearNetwork = document.getElementById('auto-op-btn-clear-network');
	const btnCopyAllNetwork = document.getElementById('auto-op-btn-copy-all-network');
	let page3ClickCount = 0,
		page3ClickTimer = null,
		resetConfirm = false;

	function closeConfigMenu() {
		if (!configMenuEl.classList.contains('open')) return;
		configMenuEl.classList.remove('open');
		configMenuEl.classList.add('closing');
		setTimeout(() => {
			configMenuEl.classList.remove('closing');
		}, 200);
	}

	function buildConfigMenu() {
		let html = '';
		for (let i = 0; i < CONFIG_COUNT; i++) {
			html += '<div class="auto-op-config-item' + (i === activeConfig ? ' active' : '') + (configs[i].isRunning ? ' has-run' : '') + '" data-ci="' + i + '">' + CONFIG_SVGS[i] + '</div>';
		}
		configMenuEl.innerHTML = html;
	}

	function openConfigMenu() {
		buildConfigMenu();
		const rect = configBtnEl.getBoundingClientRect();
		const menuHeight = CONFIG_COUNT * 36;
		const spaceBelow = window.innerHeight - rect.bottom;
		configMenuEl.style.left = Math.min(rect.left, window.innerWidth - 120) + 'px';
		configMenuEl.style.right = 'auto';
		if (spaceBelow < menuHeight + 10) {
			configMenuEl.style.top = 'auto';
			configMenuEl.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
			configMenuEl.style.transformOrigin = 'bottom left';
		} else {
			configMenuEl.style.top = (rect.bottom + 4) + 'px';
			configMenuEl.style.bottom = 'auto';
			configMenuEl.style.transformOrigin = 'top left';
		}
		configMenuEl.classList.remove('closing');
		configMenuEl.classList.remove('open');
		void configMenuEl.offsetWidth;
		configMenuEl.classList.add('open');
	}

	function updateConfigBtnLabel() {
		configBtnEl.innerHTML = CONFIG_SVGS[activeConfig];
	}
	configBtnEl.addEventListener('click', e => {
		e.stopPropagation();
		onPanelClickRestore();
		if (configMenuEl.classList.contains('open')) closeConfigMenu();
		else openConfigMenu();
	});
	document.addEventListener('click', (e) => {
		if (isProgrammaticClick) return;
		closeConfigMenu();
	});
	configMenuEl.addEventListener('click', e => {
		const item = e.target.closest('.auto-op-config-item');
		if (!item) return;
		const ci = parseInt(item.dataset.ci);
		if (!isNaN(ci) && ci !== activeConfig) switchConfig(ci);
		closeConfigMenu();
	});

	function isTooClose(px, py, positions) {
		return positions.some(p => Math.abs(p.x - px) < 220 && Math.abs(p.y - py) < 60);
	}

	function randomizePSPositions() {
		const items = [psTimeEl, psElapsedEl, psCountEl, psSwitchWrapEl];
		const w = window.innerWidth,
			h = window.innerHeight;
		const margin = 80;
		const positions = [];
		for (let i = 0; i < 4; i++) {
			let x, y, ok = false,
				attempts = 0;
			while (!ok && attempts < 100) {
				x = margin + Math.random() * Math.max(100, w - margin * 2 - 200);
				y = margin + Math.random() * Math.max(100, h - margin * 2 - 40);
				ok = !isTooClose(x, y, positions);
				attempts++;
			}
			positions.push({
				x,
				y
			});
		}
		items.forEach((item, i) => {
			if (item) {
				item.style.left = Math.round(positions[i].x) + 'px';
				item.style.top = Math.round(positions[i].y) + 'px';
			}
		});
	}

	function updatePowerSaveOverlay() {
		psTimeEl.textContent = new Date().toLocaleTimeString('zh-CN', {
			hour12: false
		});
		let totalCount = 0,
			longestElapsed = 0,
			anyRunning = false;
		for (const c of configs) {
			if (c.isRunning && c.operationStartTimestamp) {
				anyRunning = true;
				totalCount += c.clickedCount;
				const elapsed = Date.now() - c.operationStartTimestamp;
				if (elapsed > longestElapsed) longestElapsed = elapsed;
			}
		}
		psElapsedEl.textContent = anyRunning ? '运行 ' + formatElapsedTime(longestElapsed) : '未运行';
		psCountEl.textContent = '已操作 ' + totalCount + ' 次';
		randomizePSPositions();
	}

	function enablePowerSave() {
		isPowerSave = true;
		if (isPicking) exitPickMode();
		powerSaveOverlay.classList.add('active');
		psSwitchEl.checked = true;
		powerSaveCheckbox.checked = true;
		updatePowerSaveOverlay();
		if (powerSaveTimerID) clearInterval(powerSaveTimerID);
		powerSaveTimerID = setInterval(updatePowerSaveOverlay, 10000);
		try {
			const p = document.documentElement.requestFullscreen();
			if (p && p.catch) {
				p.catch(() => {
					powerSaveOverlay.dataset.needFs = '1';
				});
			}
		} catch (e) {
			powerSaveOverlay.dataset.needFs = '1';
		}
	}

	function disablePowerSave() {
		isPowerSave = false;
		powerSaveOverlay.classList.remove('active');
		if (powerSaveTimerID) {
			clearInterval(powerSaveTimerID);
			powerSaveTimerID = null;
		}
		psSwitchEl.checked = false;
		powerSaveCheckbox.checked = false;
		try {
			if (document.fullscreenElement) document.exitFullscreen();
		} catch (e) {}
		for (let i = 0; i < CONFIG_COUNT; i++) {
			const cfg = configs[i];
			for (const el of cfg.discoveredElements) {
				if (!document.contains(el)) cfg.discoveredElements.delete(el);
			}
			for (let j = cfg.targets.length - 1; j >= 0; j--) {
				const t = cfg.targets[j];
				if (t.element && !document.contains(t.element)) {
					t.element = null;
					t._isValid = false;
					t._blueParent = null;
					t._nearestEl = null;
				}
			}
		}
		const c = cv();
		countSpan.textContent = c.clickedCount;
		if (c.isRunning && c.operationStartTimestamp) {
			elapsedSpan.textContent = formatElapsedTime(Date.now() - c.operationStartTimestamp);
			if (elapsedTimerID_global) clearInterval(elapsedTimerID_global);
			elapsedTimerID_global = setInterval(() => {
				const cc = cv();
				if (!cc.isRunning || !cc.operationStartTimestamp) return;
				elapsedSpan.textContent = formatElapsedTime(Date.now() - cc.operationStartTimestamp);
			}, 1000);
		}
		statusDiv.classList.toggle('running', c.isRunning);
		refreshParentHighlights();
		updateTargetUI();
		updateTargetCount();
		if (c.targets.length > 0) stateSpan.textContent = c.isRunning ? '运行中' : '就绪';
		else stateSpan.textContent = '请选取目标元素';
	}
	powerSaveCheckbox.addEventListener('change', e => {
		e.stopPropagation();
		if (e.target.checked) enablePowerSave();
		else disablePowerSave();
	});
	psSwitchEl.addEventListener('change', () => {
		if (!psSwitchEl.checked) disablePowerSave();
		else enablePowerSave();
	});
	powerSaveOverlay.addEventListener('click', () => {
		if (powerSaveOverlay.dataset.needFs === '1' && isPowerSave) {
			try {
				const p = document.documentElement.requestFullscreen();
				if (p && p.catch) p.catch(() => {});
				powerSaveOverlay.dataset.needFs = '';
			} catch (e) {}
		}
	});
	document.addEventListener('fullscreenchange', () => {
		if (!document.fullscreenElement && isPowerSave) {
			disablePowerSave();
		}
	});

	function updateCmdTargetBtn() {
		const c = cv();
		cmdTargetBtn.disabled = !c.isMultiMode && c.targets.length > 0;
	}

	function switchConfig(newIndex) {
		if (isPicking) exitPickMode();
		hideInfoPanel(false);
		hideSettingsPanel(false);
		const old = cv();
		old.clickInterval = parseInt(clickIntervalInput.value) || 1000;
		old.maxClicks = maxClicksInput.value === '' ? Infinity : (parseInt(maxClicksInput.value) || Infinity);
		old.maxDurationMin = parseFloat(maxDurationInput.value) || 0;
		old.clickStrategy = strategySelect.value;
		old.isMultiMode = multiModeCheckbox.checked;
		old.missingAction = missingActionSelect.value;
		savePerConfig(activeConfig);
		old.targets.forEach(t => {
			if (t.element && t.element.classList) t.element.classList.remove('auto-op-selected-highlight');
			if (t._blueParent && t._blueParent.classList) {
				t._blueParent.classList.remove('auto-op-parent-highlight');
				t._blueParent.classList.remove('auto-op-parent-highlight-Overlap');
			}
			if (t._nearestEl && t._nearestEl.classList) t._nearestEl.classList.remove('auto-op-nearest-parent-highlight');
		});
		activeConfig = newIndex;
		const c = cv();
		beginQueryCycle();
		c.targets.forEach(t => {
			if (!t.element || !document.contains(t.element)) {
				const found = tryFindTarget(t);
				if (found && found.length > 0) {
					t.element = found[0];
					const pi = resolveParentInfo(found[0]);
					t.nearestParent = pi.nearestParent;
					t.blueParent = pi.blueParent;
				} else {
					t.element = null;
				}
			}
			t._isValid = t.isCommand || (!!t.element && document.contains(t.element) && matchesFingerprint(t.element, t));
		});
		c.targets.forEach(t => {
			if (t.enableHighlight !== false && t.enabled !== false && t.element && t.element.classList && document.contains(t.element)) t.element.classList.add('auto-op-selected-highlight');
		});
		multiModeCheckbox.checked = c.isMultiMode;
		strategyRow.style.display = c.isMultiMode ? 'block' : 'none';
		updateCmdTargetBtn();
		strategySelect.value = c.clickStrategy;
		maxClicksInput.value = c.maxClicks === Infinity ? '' : c.maxClicks;
		clickIntervalInput.value = c.clickInterval;
		missingActionSelect.value = c.missingAction || 'wait';
		maxDurationInput.value = c.maxDurationMin > 0 ? c.maxDurationMin : '';
		autoStartIntervalInput.value = c.autoStartIntervalMin > 0 ? c.autoStartIntervalMin : '';
		if (c.isRunning) {
			btnStart.textContent = '停止';
			btnStart.className = 'auto-op-btn auto-op-btn-stop';
			btnHeaderStart.innerHTML = '<svg viewBox="0 0 1172.4 1172.4" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M927.7 149.7 V1022.7 Q926.7 1051.7 916.7 1063.2 Q906.7 1074.7 880.7 1074.7 H852.7 Q826.7 1074.7 816.2 1062.7 Q805.7 1050.7 805.7 1022.7 V149.7 Q805.7 121.7 816.2 109.7 Q826.7 97.7 851.7 97.7 H879.7 Q907.7 97.7 917.7 109.7 Q927.7 121.7 927.7 149.7 Z M366.7 149.7 V1022.7 Q365.7 1052.7 355.7 1063.7 Q345.7 1074.7 319.7 1074.7 H291.7 Q264.7 1074.7 254.7 1062.7 Q244.7 1050.7 244.7 1022.7 V149.7 Q244.7 121.7 254.2 109.7 Q263.7 97.7 291.7 97.7 H319.7 Q347.7 97.7 357.2 109.7 Q366.7 121.7 366.7 149.7 Z" transform="matrix(1 0 0 -1 0 1172.4)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>';
			btnHeaderStart.classList.add('is-stop');
			btnPick.disabled = true;
			multiModeCheckbox.disabled = true;
			strategySelect.disabled = true;
			maxClicksInput.disabled = true;
			clickIntervalInput.disabled = true;
			missingActionSelect.disabled = true;
			maxDurationInput.disabled = true;
			autoStartIntervalInput.disabled = true;
			statusDiv.classList.add('running');
		} else {
			btnStart.textContent = '开始';
			btnStart.className = 'auto-op-btn auto-op-btn-start';
			btnHeaderStart.innerHTML = '<svg viewBox="0 0 1202.4 1202.4" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M443.7 167.2 L902.7 433.2 Q970.7 471.2 999.2 492.7 Q1027.7 514.2 1040.7 543.2 Q1051.7 571.2 1051.7 602.2 Q1051.7 633.2 1040.7 661.2 Q1027.7 690.2 999.2 711.2 Q970.7 732.2 902.7 770.2 L443.7 1036.2 Q380.7 1073.2 346.2 1087.7 Q311.7 1102.2 279.7 1099.2 Q249.7 1096.2 223.2 1081.2 Q196.7 1066.2 178.7 1041.2 Q159.7 1016.2 155.2 980.7 Q150.7 945.2 150.7 868.2 V337.2 Q150.7 258.2 155.2 223.2 Q159.7 188.2 177.7 161.2 Q196.7 137.2 223.2 121.7 Q249.7 106.2 279.7 104.2 Q311.7 100.2 345.7 114.7 Q379.7 129.2 443.7 167.2 Z M272.7 231.2 Q269.7 236.2 268.7 262.7 Q267.7 289.2 267.7 337.2 V868.2 Q267.7 916.2 268.7 941.7 Q269.7 967.2 272.7 972.2 Q274.7 977.2 280.2 980.2 Q285.7 983.2 291.7 983.2 Q296.7 983.2 320.7 970.7 Q344.7 958.2 384.7 936.2 L845.7 670.2 Q884.7 647.2 906.7 633.2 Q928.7 619.2 932.7 613.2 Q938.7 602.2 933.7 591.2 Q929.7 584.2 912.2 573.2 Q894.7 562.2 845.7 533.2 L384.7 267.2 Q343.7 243.2 321.2 231.7 Q298.7 220.2 292.7 220.2 Q278.7 220.2 272.7 231.2 Z" transform="matrix(1 0 0 -1 0 1202.4)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>';
			btnHeaderStart.classList.remove('is-stop');
			btnPick.disabled = false;
			multiModeCheckbox.disabled = false;
			strategySelect.disabled = false;
			maxClicksInput.disabled = false;
			clickIntervalInput.disabled = false;
			missingActionSelect.disabled = false;
			maxDurationInput.disabled = false;
			autoStartIntervalInput.disabled = false;
			statusDiv.classList.remove('running');
		}
		if (c.autoStartEnabled && c.autoStartIntervalMin > 0 && !c.isRunning && c.autoStartNextTime) {
			const rem = c.autoStartNextTime - Date.now();
			autoStartCountdownLabel.textContent = rem > 0 ? '距下次启动 ' + formatAutoStartCountdown(rem) : '即将启动...';
		} else {
			autoStartCountdownLabel.textContent = '';
		}
		refreshParentHighlights();
		updateTargetUI();
		updateTargetCount();
		countSpan.textContent = c.clickedCount;
		if (c.isRunning && c.operationStartTimestamp) {
			elapsedSpan.textContent = formatElapsedTime(Date.now() - c.operationStartTimestamp);
			if (elapsedTimerID_global) clearInterval(elapsedTimerID_global);
			elapsedTimerID_global = setInterval(() => {
				const cc = cv();
				if (!cc.isRunning || !cc.operationStartTimestamp) return;
				elapsedSpan.textContent = formatElapsedTime(Date.now() - cc.operationStartTimestamp);
			}, 1000);
		} else {
			elapsedSpan.textContent = '00:00:00';
			if (elapsedTimerID_global) {
				clearInterval(elapsedTimerID_global);
				elapsedTimerID_global = null;
			}
		}
		if (c.isWaiting) stateSpan.classList.add('auto-op-waiting');
		else stateSpan.classList.remove('auto-op-waiting');
		if (c.targets.length > 0) stateSpan.textContent = c.isRunning ? '运行中' : '就绪';
		else stateSpan.textContent = '请选取目标元素';
		updateConfigBtnLabel();
		saveData();
		goToPage(0, false);
	}

	function savePerConfig(ci) {
		try {
			const c = configs[ci];
			localStorage.setItem(PER_CONFIG_KEY + ci, JSON.stringify({
				isMultiMode: c.isMultiMode,
				clickStrategy: c.clickStrategy,
				clickInterval: c.clickInterval,
				maxClicks: c.maxClicks === Infinity ? '' : c.maxClicks,
				missingAction: c.missingAction || 'wait',
				autoStartIntervalMin: c.autoStartIntervalMin > 0 ? c.autoStartIntervalMin : '',
				maxDurationMin: c.maxDurationMin > 0 ? c.maxDurationMin : '',
				targets: c.targets.map(t => ({
					strict: t.strict,
					loose: t.loose,
					fingerprint: t.fingerprint,
					desc: t.desc,
					isInput: t.isInput,
					matchMode: t.matchMode,
					parentSelector: t.parentSelector,
					parentChain: t.parentChain || [],
					isAuto: !!t.isAuto,
					enabled: t.enabled !== false,
					matchTag: t.matchTag !== false,
					matchText: t.matchText !== false,
					matchTextMode: t.matchTextMode || 'exact',
					matchDataAttrs: t.matchDataAttrs !== false,
					matchAttrs: t.matchAttrs !== false,
					matchOnclick: t.matchOnclick !== false,
					autoDiscover: t.autoDiscover !== false,
					matchParent: t.matchParent !== false,
					matchId: t.matchId !== false,
					matchClass: t.matchClass !== false,
					isCommand: !!t.isCommand,
					customCommand: t.customCommand || '',
					customFill: t.customFill || '',
					customInterval: t.customInterval != null ? t.customInterval : '',
					scrollIntoView: !!t.scrollIntoView,
					showParent: !!t.showParent,
					enableHighlight: t.enableHighlight !== false,
					isCommand: !!t.isCommand,
					customCommand: t.customCommand || ''
				}))
			}));
		} catch (e) {
			console.error('[AUTO_OP] savePerConfig 异常:', e);
		}
	}

	function loadPerConfig(ci) {
		try {
			const saved = localStorage.getItem(PER_CONFIG_KEY + ci);
			if (!saved) return;
			const cfg = JSON.parse(saved),
				c = configs[ci];
			c.isMultiMode = cfg.isMultiMode || false;
			c.clickStrategy = cfg.clickStrategy || 'simultaneous';
			c.clickInterval = cfg.clickInterval || 1000;
			c.maxClicks = (cfg.maxClicks === '' || cfg.maxClicks === undefined) ? Infinity : (parseInt(cfg.maxClicks) || Infinity);
			c.missingAction = cfg.missingAction || 'wait';
			if (cfg.autoStartIntervalMin !== undefined && cfg.autoStartIntervalMin !== '' && parseFloat(cfg.autoStartIntervalMin) > 0) {
				c.autoStartEnabled = true;
				c.autoStartIntervalMin = parseFloat(cfg.autoStartIntervalMin);
			}
			if (cfg.maxDurationMin !== undefined && cfg.maxDurationMin !== '' && parseFloat(cfg.maxDurationMin) > 0) c.maxDurationMin = parseFloat(cfg.maxDurationMin);
			c.targets = [];
			(cfg.targets || []).forEach(t => {
				const autoDiscover = t.autoDiscover !== undefined ? t.autoDiscover !== false : (t.matchMode === 'loose');
				const base = {
					strict: t.strict,
					loose: t.loose,
					fingerprint: t.fingerprint,
					desc: t.desc,
					isInput: !!t.isInput,
					customFill: t.customFill || '',
					customInterval: (t.customInterval === '' || t.customInterval === undefined || t.customInterval === null) ? undefined : Number(t.customInterval),
					scrollIntoView: !!t.scrollIntoView,
					showParent: !!t.showParent,
					enableHighlight: t.enableHighlight !== false,
					isCommand: !!t.isCommand,
					customCommand: t.customCommand || '',
					parentSelector: t.parentSelector || '',
					parentChain: t.parentChain || [],
					isAuto: !!t.isAuto,
					missCount: 0,
					nearestParent: null,
					blueParent: null,
					_blueParent: null,
					_nearestEl: null,
					enabled: t.enabled !== false,
					matchTag: t.matchTag !== false,
					matchText: t.matchText !== false,
					matchTextMode: t.matchTextMode || 'exact',
					matchDataAttrs: t.matchDataAttrs !== false,
					matchAttrs: t.matchAttrs !== false,
					matchOnclick: t.matchOnclick !== false,
					autoDiscover,
					matchParent: t.matchParent !== false,
					matchId: t.matchId !== false,
					matchClass: t.matchClass !== false,
					isCommand: !!t.isCommand,
					customCommand: t.customCommand || ''
				};
				const found = base.isCommand ? [] : tryFindTarget({
					...base,
					element: null
				});
				if (found && found.length > 0) {
					found.forEach(el => {
						const obj = {
							...base,
							element: el
						};
						const parentInfo = resolveParentInfo(el);
						obj.nearestParent = parentInfo.nearestParent;
						obj.blueParent = parentInfo.blueParent;
						c.targets.push(obj);
						c.discoveredElements.add(el);
					});
				} else {
					c.targets.push({
						...base,
						element: null
					});
				}
			});
			c.targets.forEach(t => {
				t._isValid = t.isCommand || (!!t.element && document.contains(t.element) && matchesFingerprint(t.element, t));
			});
		} catch (e) {
			console.error('[AUTO_OP] loadPerConfig 异常:', e);
		}
	}

	function migrateOldData() {
		const oldKey = 'AUTO_OP_CONFIG_' + window.location.hostname;
		try {
			const saved = localStorage.getItem(oldKey);
			if (!saved) return;
			localStorage.setItem(PER_CONFIG_KEY + '0', saved);
			const cfg = JSON.parse(saved),
				shared = {};
			if (cfg.isAutoRefresh !== undefined) shared.isAutoRefresh = cfg.isAutoRefresh;
			if (cfg.refreshIntervalSec !== undefined) shared.refreshIntervalSec = cfg.refreshIntervalSec;
			if (cfg.refreshLogs) shared.refreshLogs = cfg.refreshLogs;
			if (cfg.currentPage !== undefined) shared.currentPage = cfg.currentPage;
			if (Object.keys(shared).length > 0) localStorage.setItem(SHARED_KEY, JSON.stringify(shared));
			localStorage.removeItem(oldKey);
		} catch (e) {}
	}

	function saveShared() {
		try {
			localStorage.setItem(SHARED_KEY, JSON.stringify({
				isAutoRefresh,
				refreshIntervalSec,
				refreshLogs,
				currentPage,
				activeConfig,
				wakeLock: wakeLockCheckbox.checked,
				suppressFocus: suppressFocusCheckbox.checked,
				pickPassThrough,
				panelFont,
				themeMode
			}));
		} catch (e) {}
	}

	function loadShared() {
		try {
			const saved = localStorage.getItem(SHARED_KEY);
			if (!saved) return;
			const cfg = JSON.parse(saved);
			if (cfg.isAutoRefresh !== undefined) {
				isAutoRefresh = cfg.isAutoRefresh;
				autoRefreshCheckbox.checked = isAutoRefresh;
			}
			if (cfg.refreshIntervalSec !== undefined) {
				refreshIntervalSec = cfg.refreshIntervalSec;
				refreshIntervalInput.value = refreshIntervalSec;
			}
			if (cfg.refreshLogs && Array.isArray(cfg.refreshLogs)) {
				refreshLogs = cfg.refreshLogs.map(item => typeof item === 'string' ? {
					time: item,
					msg: '页面已刷新'
				} : item);
				updateLogUI();
			}
			if (typeof cfg.currentPage === 'number') currentPage = cfg.currentPage;
			if (typeof cfg.activeConfig === 'number' && cfg.activeConfig >= 0 && cfg.activeConfig < CONFIG_COUNT) activeConfig = cfg.activeConfig;
			if (cfg.wakeLock !== undefined) wakeLockCheckbox.checked = cfg.wakeLock;
			if (cfg.suppressFocus !== undefined) suppressFocusCheckbox.checked = cfg.suppressFocus;
			if (cfg.pickPassThrough !== undefined) {
				pickPassThrough = cfg.pickPassThrough;
				pickPassThroughCheckbox.checked = pickPassThrough;
			}
			if (cfg.panelFont !== undefined) {
				panelFont = cfg.panelFont;
				panelFontSelect.value = panelFont;
				document.documentElement.style.setProperty('--auto-op-font', `"${panelFont}", system-ui`);
			}
			if (cfg.themeMode !== undefined) {
				themeMode = cfg.themeMode;
				themeModeSelect.value = themeMode;
				applyTheme();
				startThemeWatchers();
			}
		} catch (e) {}
	}

	function saveData() {
		savePerConfig(activeConfig);
		saveShared();
	}

	function loadData() {
		migrateOldData();
		loadShared();
		for (let i = 0; i < CONFIG_COUNT; i++) loadPerConfig(i);
		const c = cv();
		multiModeCheckbox.checked = c.isMultiMode;
		strategyRow.style.display = c.isMultiMode ? 'block' : 'none';
	updateCmdTargetBtn();
		strategySelect.value = c.clickStrategy;
		clickIntervalInput.value = c.clickInterval;
		maxClicksInput.value = c.maxClicks === Infinity ? '' : c.maxClicks;
		missingActionSelect.value = c.missingAction || 'wait';
		autoStartIntervalInput.value = c.autoStartIntervalMin > 0 ? c.autoStartIntervalMin : '';
		maxDurationInput.value = c.maxDurationMin > 0 ? c.maxDurationMin : '';
		c.targets.forEach(t => {
			if (t.enableHighlight !== false && t.enabled !== false && t.element && t.element.classList && document.contains(t.element)) t.element.classList.add('auto-op-selected-highlight');
		});
		updateTargetUI();
		updateTargetCount();
		refreshParentHighlights();
		if (c.targets.length > 0) stateSpan.textContent = '就绪';
		updateConfigBtnLabel();
	}

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
		if (el.id) {
			return {
				strict: base,
				loose: base
			};
		}
		let strict = base;
		const parent = el.parentElement;
		if (parent) {
			try {
				const sameTagSiblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
				if (sameTagSiblings.length > 1) strict += ':nth-of-type(' + (sameTagSiblings.indexOf(el) + 1) + ')';
			} catch (e) {}
		}
		return {
			strict,
			loose: base
		};
	}

	function isInputField(el) {
		if (!el) return false;
		if (el.isContentEditable || el.tagName === 'TEXTAREA') return true;
		if (el.tagName === 'INPUT') {
			const t = (el.type || '').toLowerCase();
			return t !== 'checkbox' && t !== 'radio' && t !== 'hidden' && t !== 'file' && t !== 'color' && t !== 'submit' && t !== 'button' && t !== 'reset' && t !== 'image';
		}
		return false;
	}

	function getElText(el) {
		let text = (el.textContent || '').trim();
		if (!text) {
			for (const attr of ['alt', 'title', 'placeholder', 'aria-label', 'value']) {
				const val = el.getAttribute(attr);
				if (val && val.trim() && val.trim().length < 50) {
					text = val.trim();
					break;
				}
			}
		}
		if (!text && el.children.length > 0) {
			for (const child of el.children) {
				const cText = (child.textContent || '').trim();
				if (cText) {
					text = cText;
					break;
				}
				for (const attr of ['alt', 'title']) {
					const val = child.getAttribute(attr);
					if (val && val.trim()) {
						text = val.trim();
						break;
					}
				}
				if (text) break;
			}
		}
		if (!text) {
			try {
				for (const pseudo of ['::before', '::after']) {
					const computedStyle = window.getComputedStyle(el, pseudo);
					let content = computedStyle.getPropertyValue('content');
					if (content && content !== 'none' && content !== 'normal' && content !== '""') {
						content = content.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
						if (content && !(content.length <= 2 && /[\uE000-\uF8FF]/.test(content))) {
							text = content;
							break;
						}
					}
				}
			} catch (e) {}
		}
		return text;
	}

	function getElementFingerprint(el) {
		const dataAttrs = {},
			attrs = {};
		const keyAttrs = ['href', 'src', 'value', 'type', 'name', 'role', 'alt', 'title', 'placeholder', 'action', 'method', 'onclick'];
		Array.from(el.attributes).forEach(attr => {
			if (attr.name.startsWith('data-')) dataAttrs[attr.name] = attr.value;
			else if (keyAttrs.includes(attr.name)) attrs[attr.name] = attr.value;
		});
		let onclickParam = '';
		if (attrs.onclick) {
			const match = attrs.onclick.match(/useItem\((\d+)\)/);
			if (match) onclickParam = match[1];
		}
		let text = getElText(el);
		if (!text && isInputField(el) && el.value != null && String(el.value).trim()) text = String(el.value).trim();
		return {
			tagName: el.tagName.toLowerCase(),
			text,
			dataAttrs,
			attrs,
			onclickParam,
			id: el.id || '',
			className: (typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(c => c && !c.startsWith('auto-op-')).join(' ') : ''),
			hasStrong: !!el.id || Object.keys(dataAttrs).length > 0 || keyAttrs.some(k => attrs[k])
		};
	}

	function matchesFingerprint(el, t) {
		if (!el) return false;
		const fp = t.fingerprint;
		const matchTag = t.matchTag !== false,
			matchText = t.matchText !== false,
			matchDataAttrs = t.matchDataAttrs !== false,
			matchAttrs = t.matchAttrs !== false,
			matchOnclick = t.matchOnclick !== false,
			matchId = t.matchId !== false,
			matchClass = t.matchClass !== false,
			matchParent = t.matchParent !== false,
			textMode = t.matchTextMode || 'exact';
		if (matchTag && el.tagName.toLowerCase() !== fp.tagName) return false;
		if (matchParent && t.parentSelector) {
			let parent;
			try {
				parent = document.querySelector(t.parentSelector);
			} catch (e) {}
			if (!parent || !parent.contains(el)) return false;
		}
		if (matchId && fp.id && el.id !== fp.id) return false;
		if (matchClass && fp.className) {
			const elCls = (typeof el.className === 'string' ? el.className.trim() : '');
			const fpClasses = fp.className.split(/\s+/).filter(Boolean);
			const elClasses = elCls.split(/\s+/).filter(Boolean);
			if (!fpClasses.every(c => elClasses.includes(c))) return false;
		}
		if (matchDataAttrs) {
			for (const [k, v] of Object.entries(fp.dataAttrs)) {
				if (v && el.getAttribute(k) !== v) return false;
			}
		}
		if (matchAttrs) {
			for (const [k, v] of Object.entries(fp.attrs)) {
				if (v && el.getAttribute(k) !== v) return false;
			}
		}
		if (matchOnclick && fp.onclickParam) {
			const m = (el.getAttribute('onclick') || '').match(/useItem\((\d+)\)/);
			if (m && m[1] !== fp.onclickParam) return false;
		}
		if (matchText && fp.text) {
			let elText;
			if (fp.hasStrong) {
				elText = (el.textContent || '').trim();
				if (!elText) {
					for (const attr of ['alt', 'title', 'placeholder', 'aria-label', 'value']) {
						const val = el.getAttribute(attr);
						if (val && val.trim()) {
							elText = val.trim();
							break;
						}
					}
				}
				if (!elText && isInputField(el) && el.value != null && String(el.value).trim()) elText = String(el.value).trim();
			} else {
				elText = getElText(el);
			}
			if (!elText) return false;
			if (textMode === 'fuzzy') {
				if (!elText.includes(fp.text)) return false;
			} else {
				if (elText !== fp.text) return false;
			}
		}
		return true;
	}
	let _queryCache = null;

	function beginQueryCycle() {
		_queryCache = new Map();
	}

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
			for (const el of list) {
				if (panel.contains(el)) continue;
				if (matchesFingerprint(el, targetObj)) matched.push(el);
			}
			return matched.length > 0 ? matched : null;
		}
		let root = document;
		const useParent = targetObj.matchParent !== false && targetObj.parentSelector;
		if (useParent) {
			try {
				const p = document.querySelector(targetObj.parentSelector);
				if (p) root = p;
			} catch (e) {}
		}
		try {
			if (targetObj.strict) {
				const found = verifyList(cachedQuery(root, targetObj.strict));
				if (found) return found;
			}
			if (targetObj.loose) {
				const found = verifyList(cachedQuery(root, targetObj.loose));
				if (found) return found;
			}
			const found = verifyList(cachedQuery(root, fp.tagName));
			if (found) return found;
		} catch (e) {}
		if (root !== document) {
			try {
				if (targetObj.strict) {
					const found = verifyList(cachedQuery(document, targetObj.strict));
					if (found) return found;
				}
				if (targetObj.loose) {
					const found = verifyList(cachedQuery(document, targetObj.loose));
					if (found) return found;
				}
			} catch (e) {}
		}
		return null;
	}

	function resolveParentInfo(el) {
		const result = {
			nearestParent: el.parentElement,
			blueParent: null
		};
		let ancestor = el.parentElement;
		while (ancestor && ancestor !== document.body) {
			const s = buildBaseSelector(ancestor);
			if (s !== ancestor.tagName.toLowerCase()) {
				result.blueParent = ancestor;
				break;
			}
			ancestor = ancestor.parentElement;
		}
		return result;
	}

	function refreshParentHighlights() {
		if (isPowerSave) return;
		const c = cv();
		const newBlueMap = new Map(),
			newNearestMap = new Map();
		for (const t of c.targets) {
			if (t.enabled === false) continue;
			if (t.enableHighlight === false) continue;
			if (!t.element || !document.contains(t.element)) continue;
			if (t.blueParent && document.contains(t.blueParent) && !panel.contains(t.blueParent)) {
				if (!newBlueMap.has(t.blueParent)) newBlueMap.set(t.blueParent, []);
				newBlueMap.get(t.blueParent).push(t.element);
			}
			let nearest = t.nearestParent || t.element.parentElement;
			if (nearest && document.contains(nearest) && !panel.contains(nearest)) {
				if (!newNearestMap.has(nearest)) newNearestMap.set(nearest, []);
				newNearestMap.get(nearest).push(t.element);
			}
		}
		for (const t of c.targets) {
			if (t._blueParent && !newBlueMap.has(t._blueParent)) {
				t._blueParent.classList.remove('auto-op-parent-highlight');
				t._blueParent.classList.remove('auto-op-parent-highlight-Overlap');
				t._blueParent = null;
			}
			if (t._nearestEl && !newNearestMap.has(t._nearestEl)) {
				t._nearestEl.classList.remove('auto-op-nearest-parent-highlight');
				t._nearestEl = null;
			}
		}
		for (const [parent, children] of newBlueMap) {
			const isOverlap = newNearestMap.has(parent);
			if (isOverlap) {
				parent.classList.remove('auto-op-parent-highlight');
				parent.classList.add('auto-op-parent-highlight-Overlap');
			} else {
				parent.classList.remove('auto-op-parent-highlight-Overlap');
				parent.classList.add('auto-op-parent-highlight');
			}
			for (const child of children) {
				const t = c.targets.find(tt => tt.element === child);
				if (t) t._blueParent = parent;
			}
		}
		for (const [parent, children] of newNearestMap) {
			if (newBlueMap.has(parent)) continue;
			if (!parent.classList.contains('auto-op-nearest-parent-highlight')) parent.classList.add('auto-op-nearest-parent-highlight');
			for (const child of children) {
				const t = c.targets.find(tt => tt.element === child);
				if (t) t._nearestEl = parent;
			}
		}
	}

	function discoverNewTargetsFor(ci) {
		const c = configs[ci];
		if (c.targets.length === 0 || !c.targets.some(t => t.autoDiscover !== false)) return;
		const existingElements = new Set(c.targets.map(t => t.element));
		for (const el of c.discoveredElements) {
			if (!document.contains(el)) c.discoveredElements.delete(el);
		}
		const newTargets = [],
			seenKeys = new Set();
		for (const t of c.targets) {
			if (t.autoDiscover === false || !t.parentSelector) continue;
			const selector = t.loose || t.strict,
				seenKey = selector + '|' + t.parentSelector;
			if (seenKeys.has(seenKey)) continue;
			seenKeys.add(seenKey);
			let parent;
			try {
				parent = document.querySelector(t.parentSelector);
			} catch (e) {}
			if (!parent) continue;
			let candidates;
			try {
				candidates = parent.querySelectorAll(selector);
			} catch (e) {
				candidates = [];
			}
			if (!candidates || candidates.length === 0) {
				try {
					candidates = parent.querySelectorAll(t.fingerprint.tagName);
				} catch (e) {
					candidates = [];
				}
			}
			for (const el of candidates) {
				if (panel.contains(el) || existingElements.has(el) || c.discoveredElements.has(el) || !matchesFingerprint(el, t)) continue;
				c.discoveredElements.add(el);
				if (ci === activeConfig && t.enableHighlight !== false && t.enabled !== false) el.classList.add('auto-op-selected-highlight');
				const pi = resolveParentInfo(el);
				newTargets.push({
					element: el,
					strict: t.strict,
					loose: t.loose,
					fingerprint: t.fingerprint,
					desc: t.desc,
					isInput: t.isInput,
					matchMode: t.matchMode,
					parentSelector: t.parentSelector,
					parentChain: t.parentChain,
					nearestParent: pi.nearestParent,
					blueParent: pi.blueParent,
					isAuto: true,
					missCount: 0,
					enabled: t.enabled,
					matchTag: t.matchTag,
					matchText: t.matchText,
					matchTextMode: t.matchTextMode,
					matchDataAttrs: t.matchDataAttrs,
					matchAttrs: t.matchAttrs,
					matchOnclick: t.matchOnclick,
					autoDiscover: t.autoDiscover,
					matchParent: t.matchParent,
					matchId: t.matchId,
					matchClass: t.matchClass
				});
			}
		}
		if (newTargets.length > 0) c.targets.push(...newTargets);
	}

	function updatePageHeight() {
		const pages = pageContainer.querySelectorAll('.auto-op-page'),
			el = pages[currentPage];
		if (!el) return;
		const h = el.offsetHeight;
		if (h > 0) pageContainer.style.height = (h + 2) + 'px';
	}

	function goToPage(page, animated) {
		closeConfigMenu();
		if (infoOverlayEl.classList.contains('open')) hideInfoPanel(false);
		if (settingsOverlayEl.classList.contains('open')) hideSettingsPanel(false);
		if (networkOverlayEl.classList.contains('open')) hideNetworkOverlay(false);
		const clamped = ((page % PAGE_COUNT) + PAGE_COUNT) % PAGE_COUNT;
		if (clamped === currentPage && animated !== false) return;
		if (clamped !== 4 && resetBtn.style.display !== 'none') {
			resetBtn.style.display = 'none';
			resetConfirm = false;
			resetBtn.textContent = '恢复默认设置';
			resetBtn.classList.remove('confirm');
			if (resetConfirmTimer) { clearTimeout(resetConfirmTimer); resetConfirmTimer = null; }
			page3ClickCount = 0;
			if (page3ClickTimer) { clearTimeout(page3ClickTimer); page3ClickTimer = null; }
			updatePageHeight();
		}
		const pages = pageContainer.querySelectorAll('.auto-op-page'),
			oldPage = pages[currentPage],
			newPage = pages[clamped];
		currentPage = clamped;
		pageButtons.forEach(btn => {
			btn.classList.toggle('active', parseInt(btn.dataset.page) === clamped);
		});
		if (animated === false) {
			pages.forEach(p => {
				p.classList.remove('active');
				p.style.opacity = '0';
			});
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
		saveShared();
	}
	pageButtons.forEach(btn => {
		btn.addEventListener('click', e => {
			e.stopPropagation();
			const page = parseInt(btn.dataset.page);
			if (page === 4 && currentPage === 4) {
				page3ClickCount++;
				if (page3ClickTimer) clearTimeout(page3ClickTimer);
				page3ClickTimer = setTimeout(() => { page3ClickCount = 0; }, 2000);
				if (page3ClickCount >= 4) {
					page3ClickCount = 0;
					if (page3ClickTimer) { clearTimeout(page3ClickTimer); page3ClickTimer = null; }
					resetBtn.style.display = 'block';
					resetConfirm = false;
					resetBtn.textContent = '恢复默认设置';
					resetBtn.classList.remove('confirm');
					updatePageHeight();
				}
			} else {
				page3ClickCount = 0;
				if (page3ClickTimer) { clearTimeout(page3ClickTimer); page3ClickTimer = null; }
			}
			goToPage(page);
		});
	});

	function measureCollapsedWidth() {
		const h3 = dragHandle.querySelector('h3'),
			wasCollapsed = panel.classList.contains('collapsed');
		if (!wasCollapsed) panel.classList.add('collapsed');
		const savedWidth = panel.style.width,
			savedTransition = panel.style.transition;
		panel.style.transition = 'none';
		panel.style.width = '300px';
		void panel.offsetWidth;
		collapsedWidth = 14 + 30 + 12 + 30 + 12 + h3.offsetWidth + 12 + 30 + 14 + 2;
		panel.style.width = savedWidth || '';
		panel.style.transition = savedTransition;
		if (!wasCollapsed) panel.classList.remove('collapsed');
	}

	function performCollapse() {
		closeConfigMenu();
		const body = panel.querySelector('.auto-op-body');
		collapseAnimPhase = 'collapsing';
		body.style.overflow = 'hidden';
		toggleBtn.innerHTML = '<svg viewBox="0 0 1155.6 1155.6" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M214.3 692.3 V936.3 Q214.3 938.3 215.8 939.8 Q217.3 941.3 219.3 941.3 H463.3 Q479.3 941.3 491.8 953.3 Q504.3 965.3 504.3 981.3 V1018.3 Q504.3 1035.3 492.3 1047.3 Q480.3 1059.3 463.3 1059.3 H155.3 Q129.3 1059.3 112.8 1043.3 Q96.3 1027.3 96.3 1001.3 V692.3 Q96.3 676.3 108.8 663.8 Q121.3 651.3 137.3 651.3 H174.3 Q190.3 651.3 202.3 663.3 Q214.3 675.3 214.3 692.3 Z M686.3 577.3 Q686.3 622.3 654.3 654.3 Q622.3 686.3 577.3 686.3 Q532.3 686.3 500.3 654.3 Q468.3 622.3 468.3 577.3 Q468.3 532.3 500.3 500.3 Q532.3 468.3 577.3 468.3 Q621.3 468.3 653.8 500.8 Q686.3 533.3 686.3 577.3 Z M1059.3 154.3 V463.3 Q1059.3 480.3 1047.3 492.3 Q1035.3 504.3 1018.3 504.3 H981.3 Q965.3 504.3 952.8 492.3 Q940.3 480.3 940.3 463.3 V219.3 Q940.3 214.3 936.3 214.3 H691.3 Q675.3 214.3 663.3 202.3 Q651.3 190.3 651.3 174.3 V136.3 Q651.3 120.3 663.3 108.3 Q675.3 96.3 691.3 96.3 H1001.3 Q1027.3 97.3 1043.3 112.8 Q1059.3 128.3 1059.3 154.3 Z" transform="matrix(1 0 0 -1 0 1155.6)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>';
		panel.classList.add('body-hidden');
		setTimeout(() => {
			panel.classList.remove('body-hidden');
			panel.classList.add('collapsed');
			const h3W = dragHandle.querySelector('h3').scrollWidth;
			collapsedWidth = 14 + 30 + 12 + 30 + 12 + h3W + 12 + 30 + 14 + 2;
			panel.style.width = '300px';
			void panel.offsetWidth;
			panel.style.width = collapsedWidth + 'px';
			collapseAnimPhase = 'collapsed';
			schedulePanelTransparent(1000);
		}, 200);
	}

	function performExpand() {
		closeConfigMenu();
		const body = panel.querySelector('.auto-op-body');
		collapseAnimPhase = 'expanding';
		panel.style.width = collapsedWidth + 'px';
		void panel.offsetWidth;
		panel.style.width = '300px';
		setTimeout(() => {
			panel.classList.remove('collapsed');
			panel.style.width = '';
			toggleBtn.innerHTML = '<svg viewBox="0 0 1153.2 1153.2" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M768.1 135.1 V380.1 Q768.1 382.1 769.6 384.1 Q771.1 386.1 773.1 386.1 H1018.1 Q1034.1 386.1 1045.6 397.6 Q1057.1 409.1 1057.1 425.1 V462.1 Q1057.1 478.1 1045.6 490.1 Q1034.1 502.1 1018.1 502.1 H708.1 Q682.1 502.1 666.6 486.1 Q651.1 470.1 651.1 444.1 V135.1 Q651.1 119.1 663.1 107.6 Q675.1 96.1 691.1 96.1 H728.1 Q744.1 96.1 756.1 107.6 Q768.1 119.1 768.1 135.1 Z M502.1 709.1 V1018.1 Q502.1 1034.1 490.6 1045.6 Q479.1 1057.1 463.1 1057.1 H426.1 Q409.1 1057.1 397.6 1045.6 Q386.1 1034.1 386.1 1018.1 V774.1 Q386.1 768.1 380.1 768.1 H136.1 Q120.1 768.1 108.1 756.6 Q96.1 745.1 96.1 728.1 V691.1 Q96.1 675.1 107.6 663.6 Q119.1 652.1 136.1 652.1 H445.1 Q471.1 652.1 486.6 668.1 Q502.1 684.1 502.1 709.1 Z" transform="matrix(1 0 0 -1 0 1153.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>';
			setTimeout(() => {
				body.style.overflow = 'auto';
				collapseAnimPhase = 'expanded';
			}, 150);
		}, 120);
		restorePanelOpacity();
		if (isPicking) setPanelTransparent();
	}

	function setPanelTransparent() {
		if (isPanelTransparent) return;
		isPanelTransparent = true;
		panel.style.opacity = '0.65';
	}

	function restorePanelOpacity() {
		if (panelTransparentTimer) {
			clearTimeout(panelTransparentTimer);
			panelTransparentTimer = null;
		}
		if (panelClickRestoreTimer) {
			clearTimeout(panelClickRestoreTimer);
			panelClickRestoreTimer = null;
		}
		if (!isPanelTransparent) return;
		isPanelTransparent = false;
		panel.style.opacity = '';
		if (!isPicking && collapseAnimPhase === 'collapsed') schedulePanelTransparent(1000);
	}

	function schedulePanelTransparent(delayMs) {
		if (panelTransparentTimer) clearTimeout(panelTransparentTimer);
		panelTransparentTimer = setTimeout(() => {
			panelTransparentTimer = null;
			setPanelTransparent();
		}, delayMs);
	}

	function onPanelClickRestore() {
		if (!isPanelTransparent) return;
		restorePanelOpacity();
		if (panelClickRestoreTimer) clearTimeout(panelClickRestoreTimer);
		panelClickRestoreTimer = setTimeout(() => {
			panelClickRestoreTimer = null;
			if (isPicking || collapseAnimPhase === 'collapsed') setPanelTransparent();
		}, 2000);
	}

	function showConfirm(text) {
		return new Promise(resolve => {
			const modal = document.getElementById('auto-op-modal'),
				modalText = document.getElementById('auto-op-modal-text'),
				btnOk = document.getElementById('auto-op-modal-ok'),
				btnCancel = document.getElementById('auto-op-modal-cancel'),
				overlay = modal.querySelector('.auto-op-modal-overlay'),
				box = modal.querySelector('.auto-op-modal-box');
			modalText.textContent = text;
			modal.style.display = 'block';
			const onBoxClick = e => e.stopPropagation();
			box.addEventListener('click', onBoxClick);

			function cleanup() {
				modal.style.display = 'none';
				btnOk.removeEventListener('click', onOk);
				btnCancel.removeEventListener('click', onCancel);
				overlay.removeEventListener('click', onOverlay);
				box.removeEventListener('click', onBoxClick);
			}

			function onOk() {
				cleanup();
				resolve(true);
			}

			function onCancel() {
				cleanup();
				resolve(false);
			}

			function onOverlay() {
				cleanup();
				resolve(false);
			}
			btnOk.addEventListener('click', onOk);
			btnCancel.addEventListener('click', onCancel);
			overlay.addEventListener('click', onOverlay);
		});
	}

	function formatRefreshTime(ms) {
		const totalSec = Math.max(0, Math.ceil(ms / 1000)),
			h = Math.floor(totalSec / 3600),
			m = Math.floor((totalSec % 3600) / 60),
			s = totalSec % 60;
		const pad = n => String(n).padStart(2, '0');
		return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
	}

	function addRefreshLog(msg) {
		const stamp = new Date().toLocaleString('zh-CN', {
			hour12: false,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
		refreshLogs.push({
			time: stamp,
			msg: msg || '页面已刷新'
		});
		updateLogUI();
	}

	function updateLogUI() {
		if (refreshLogs.length === 0) {
			logContainer.innerHTML = '<div class="auto-op-log-empty">暂无日志</div>';
			return;
		}
		let html = '';
		for (let i = 0; i < refreshLogs.length; i++) html += '<div class="auto-op-log-entry"><span class="auto-op-log-time">' + refreshLogs[i].time + '</span><span class="auto-op-log-msg">' + refreshLogs[i].msg + '</span></div>';
		logContainer.innerHTML = html;
		logContainer.scrollTop = logContainer.scrollHeight;
	}

	function saveRefreshState() {
		try {
			const now = Date.now();
			const totalMs = refreshIntervalSec * 1000;
			const elapsed = now - refreshStartTimestamp;
			const remaining = Math.max(0, totalMs - elapsed);
			const running = {};
			for (let i = 0; i < CONFIG_COUNT; i++) {
				const c = configs[i];
				if (c.isRunning) {
					running[i] = {
						opStart: c.operationStartTimestamp || now,
						count: c.clickedCount
					};
				}
			}
			localStorage.setItem(REFRESH_STATE_KEY, JSON.stringify({
				active: isAutoRefresh,
				interval: refreshIntervalSec,
				nextRefreshTime: now + remaining,
				logs: refreshLogs,
				isPowerSave: isPowerSave,
				running: running
			}));
		} catch (e) {
			console.error('[AUTO_OP] saveRefreshState 异常:', e);
		}
	}

	function loadRefreshState() {
		try {
			const s = localStorage.getItem(REFRESH_STATE_KEY);
			return s ? JSON.parse(s) : null;
		} catch (e) {
			return null;
		}
	}

	function clearRefreshState() {
		try {
			localStorage.removeItem(REFRESH_STATE_KEY);
		} catch (e) {}
	}

	function updateRefreshProgressUI() {
		if (!isAutoRefresh || !refreshStartTimestamp) return;
		const now = Date.now(),
			totalMs = refreshIntervalSec * 1000,
			elapsed = now - refreshStartTimestamp,
			remaining = Math.max(0, totalMs - elapsed);
		const percent = Math.min(100, Math.max(0, (elapsed / totalMs) * 100));
		refreshPercentSpan.textContent = percent.toFixed(1) + '%';
		refreshTimeSpan.textContent = '剩余 ' + formatRefreshTime(remaining);
		refreshProgressFill.style.width = percent.toFixed(2) + '%';
		if (remaining < 30000) {
			refreshProgressFill.style.background = 'var(--panel-missing-border)';
			refreshPercentSpan.style.color = 'var(--panel-missing-border)';
		} else {
			refreshProgressFill.style.background = 'var(--panel-highlight-border)';
			refreshPercentSpan.style.color = 'var(--panel-highlight-border)';
		}
		if (remaining <= 0) triggerRefresh();
	}

	function triggerRefresh() {
		const runningConfigs = [];
		for (let i = 0; i < CONFIG_COUNT; i++) {
			if (configs[i].isRunning) runningConfigs.push(CONFIG_NAMES[i]);
		}
		const statusMsg = runningConfigs.length > 0 ? '运行中 [' + runningConfigs.join(',') + ']' : '未运行';
		addRefreshLog('页面已刷新 ' + statusMsg);
		saveRefreshState();
		saveData();
		for (let i = 0; i < CONFIG_COUNT; i++) savePerConfig(i);
		if (refreshProgressTimerID) {
			clearInterval(refreshProgressTimerID);
			refreshProgressTimerID = null;
		}
		if (refreshTimerID) {
			clearTimeout(refreshTimerID);
			refreshTimerID = null;
		}
		location.reload();
	}

	function startAutoRefreshCountdown(initial) {
		isAutoRefresh = true;
		autoRefreshCheckbox.checked = true;
		refreshProgressDiv.style.display = 'block';
		if (initial) refreshStartTimestamp = Date.now();
		if (refreshProgressTimerID) clearInterval(refreshProgressTimerID);
		refreshProgressTimerID = setInterval(updateRefreshProgressUI, 100);
		const remaining = Math.max(0, refreshIntervalSec * 1000 - (Date.now() - refreshStartTimestamp));
		if (refreshTimerID) clearTimeout(refreshTimerID);
		refreshTimerID = setTimeout(triggerRefresh, remaining + 50);
		updateRefreshProgressUI();
		requestWakeLock();
	}

	function stopAutoRefreshCountdown() {
		isAutoRefresh = false;
		if (refreshProgressTimerID) {
			clearInterval(refreshProgressTimerID);
			refreshProgressTimerID = null;
		}
		if (refreshTimerID) {
			clearTimeout(refreshTimerID);
			refreshTimerID = null;
		}
		refreshProgressDiv.style.display = 'none';
		refreshProgressFill.style.width = '0%';
		refreshPercentSpan.textContent = '0%';
		refreshTimeSpan.textContent = '剩余 --:--';
		clearRefreshState();
		if (!configs.some(c => c.isRunning)) releaseWakeLock();
	}

	function formatAutoStartCountdown(ms) {
		const totalSec = Math.max(0, Math.ceil(ms / 1000)),
			h = Math.floor(totalSec / 3600),
			m = Math.floor((totalSec % 3600) / 60),
			s = totalSec % 60;
		const pad = n => String(n).padStart(2, '0');
		return h > 0 ? h + 'h' + pad(m) + 'm' + pad(s) + 's' : pad(m) + 'm' + pad(s) + 's';
	}

	function updateAutoStartCountdownUI() {
		const c = cv();
		if (!c.autoStartEnabled || c.autoStartIntervalMin <= 0 || !c.autoStartNextTime) {
			autoStartCountdownLabel.textContent = '';
			return;
		}
		const remaining = c.autoStartNextTime - Date.now();
		autoStartCountdownLabel.textContent = remaining <= 0 ? '即将启动...' : '距下次启动 ' + formatAutoStartCountdown(remaining);
	}

	function doAutoStartFor(ci) {
		const c = configs[ci];
		if (c.isRunning) return;
		if (c.targets.length === 0) {
			c.autoStartNextTime = Date.now() + c.autoStartIntervalMin * 60 * 1000;
			startAutoStartCountdownTimerFor(ci);
			return;
		}
		startClickingFor(ci);
		c.autoStartNextTime = Date.now() + c.autoStartIntervalMin * 60 * 1000;
	}

	function startAutoStartCountdownTimerFor(ci) {
		const c = configs[ci];
		if (c.autoStartCountdownTimerID) {
			clearInterval(c.autoStartCountdownTimerID);
			c.autoStartCountdownTimerID = null;
		}
		if (!c.autoStartEnabled || c.autoStartIntervalMin <= 0 || !c.autoStartNextTime) {
			if (ci === activeConfig) updateAutoStartCountdownUI();
			return;
		}
		c.autoStartCountdownTimerID = setInterval(() => {
			const remaining = c.autoStartNextTime - Date.now();
			if (ci === activeConfig) updateAutoStartCountdownUI();
			if (remaining <= 0) {
				clearInterval(c.autoStartCountdownTimerID);
				c.autoStartCountdownTimerID = null;
				doAutoStartFor(ci);
			}
		}, 500);
		if (ci === activeConfig) updateAutoStartCountdownUI();
	}

	function stopAutoStartCountdownTimerFor(ci) {
		const c = configs[ci];
		if (c.autoStartCountdownTimerID) {
			clearInterval(c.autoStartCountdownTimerID);
			c.autoStartCountdownTimerID = null;
		}
		c.autoStartNextTime = 0;
		if (ci === activeConfig) autoStartCountdownLabel.textContent = '';
	}

	function setupAutoStartFromInput() {
		const c = cv();
		const val = parseFloat(autoStartIntervalInput.value);
		if (isNaN(val) || val <= 0) {
			c.autoStartEnabled = false;
			c.autoStartIntervalMin = 0;
			stopAutoStartCountdownTimerFor(activeConfig);
			autoStartIntervalInput.value = '';
		} else {
			c.autoStartEnabled = true;
			c.autoStartIntervalMin = val;
			if (!c.isRunning) {
				c.autoStartNextTime = Date.now() + val * 60 * 1000;
				startAutoStartCountdownTimerFor(activeConfig);
			}
		}
		savePerConfig(activeConfig);
	}

	function formatElapsedTime(ms) {
		const totalSec = Math.floor(ms / 1000),
			h = Math.floor(totalSec / 3600),
			m = Math.floor((totalSec % 3600) / 60),
			s = totalSec % 60;
		const pad = n => String(n).padStart(2, '0');
		return pad(h) + ':' + pad(m) + ':' + pad(s);
	}

	function startElapsedTimer(savedTimestamp) {
		if (isPowerSave) return;
		if (elapsedTimerID_global) clearInterval(elapsedTimerID_global);
		const c = cv();
		c.operationStartTimestamp = savedTimestamp || Date.now();
		if (elapsedSpan) elapsedSpan.textContent = formatElapsedTime(Date.now() - c.operationStartTimestamp);
		elapsedTimerID_global = setInterval(() => {
			const cc = cv();
			if (!cc.isRunning || !cc.operationStartTimestamp) return;
			if (elapsedSpan) elapsedSpan.textContent = formatElapsedTime(Date.now() - cc.operationStartTimestamp);
		}, 1000);
	}

	function stopElapsedTimer() {
		if (elapsedTimerID_global) {
			clearInterval(elapsedTimerID_global);
			elapsedTimerID_global = null;
		}
	}
	targetListContainer.addEventListener('click', async e => {
		const target = e.target.closest('[data-action]');
		if (!target) return;
		const action = target.dataset.action;
		const index = parseInt(target.dataset.index),
			c = cv();
		if (isNaN(index) || !c.targets[index]) {
			updateTargetUI();
			return;
		}
		if (action === 'info') {
			showInfoPanel(index);
			return;
		}
		if (action === 'settings') {
			showSettingsPanel(index);
			return;
		}
		if (action === 'delete') {
			const t = c.targets[index];
			if (IS_MOBILE && !await showConfirm('确定删除该目标元素？\n\n' + t.desc)) return;
			if (t.element && t.element.classList) t.element.classList.remove('auto-op-selected-highlight');
			if (t._blueParent && t._blueParent.classList) {
				t._blueParent.classList.remove('auto-op-parent-highlight');
				t._blueParent.classList.remove('auto-op-parent-highlight-Overlap');
			}
			if (t._nearestEl && t._nearestEl.classList) t._nearestEl.classList.remove('auto-op-nearest-parent-highlight');
			c.targets.splice(index, 1);
			if (c.currentQueueIndex >= c.targets.length) c.currentQueueIndex = 0;
			updateTargetUI();
			updateTargetCount();
			if (c.targets.length === 0) {
				stateSpan.textContent = '目标元素已清空';
				if (stateTimerID) {
					clearTimeout(stateTimerID);
					stateTimerID = null;
				}
				stateTimerID = setTimeout(() => {
					if (stateSpan.textContent === '目标元素已清空') stateSpan.textContent = '请选取目标元素';
					stateTimerID = null;
				}, 1000);
			} else {
				stateSpan.textContent = `剩余 ${c.targets.length} 个`;
			}
			refreshParentHighlights();
			savePerConfig(activeConfig);
		}
		if (action === 'move-up' && index > 0) {
			const listEl = targetListContainer.querySelector('.auto-op-target-list');
			const scrollTop = listEl ? listEl.scrollTop : 0;
			[c.targets[index], c.targets[index - 1]] = [c.targets[index - 1], c.targets[index]];
			if (c.currentQueueIndex === index) c.currentQueueIndex = index - 1;
			else if (c.currentQueueIndex === index - 1) c.currentQueueIndex = index;
			updateTargetUI();
			updateTargetCount();
			refreshParentHighlights();
			const newListEl = targetListContainer.querySelector('.auto-op-target-list');
			if (newListEl) newListEl.scrollTop = scrollTop;
			savePerConfig(activeConfig);
		}
		if (action === 'move-down' && index < c.targets.length - 1) {
			const listEl = targetListContainer.querySelector('.auto-op-target-list');
			const scrollTop = listEl ? listEl.scrollTop : 0;
			[c.targets[index], c.targets[index + 1]] = [c.targets[index + 1], c.targets[index]];
			if (c.currentQueueIndex === index) c.currentQueueIndex = index + 1;
			else if (c.currentQueueIndex === index + 1) c.currentQueueIndex = index;
			updateTargetUI();
			updateTargetCount();
			refreshParentHighlights();
			const newListEl = targetListContainer.querySelector('.auto-op-target-list');
			if (newListEl) newListEl.scrollTop = scrollTop;
			savePerConfig(activeConfig);
		}
	});
	let infoAnimTimer = null,
		infoCurrentIndex = -1;

	function refreshInfoHeight() {
		if (infoOverlayEl.classList.contains('open')) fitBodyToOverlay(infoOverlayEl);
	}

	function refreshSettingsHeight() {
		if (settingsOverlayEl.classList.contains('open')) fitBodyToOverlay(settingsOverlayEl);
	}

	function showInfoPanel(index) {
		const c = cv();
		const t = c.targets[index];
		if (!t || t.isCommand) return;
		infoCurrentIndex = index;
		if (settingsOverlayEl.classList.contains('open')) hideSettingsPanel(false);
		if (networkOverlayEl.classList.contains('open')) hideNetworkOverlay(false);
		clearTestHighlights();
		document.querySelectorAll('.auto-op-parent-highlight,.auto-op-parent-highlight-Overlap,.auto-op-nearest-parent-highlight,.auto-op-selected-highlight').forEach(el => {
			el.classList.remove('auto-op-parent-highlight', 'auto-op-parent-highlight-Overlap', 'auto-op-nearest-parent-highlight', 'auto-op-selected-highlight');
		});
		if (infoAnimTimer) {
			clearTimeout(infoAnimTimer);
			infoAnimTimer = null;
		}
		infoOverlayEl.removeEventListener('transitionend', onInfoCloseTransition);
		infoTitleEl.textContent = t.desc || '元素详情';
		const fp = t.fingerprint || {};
		const dataAttrKeys = Object.keys(fp.dataAttrs || {});
		const attrKeys = Object.keys(fp.attrs || {});
		let html = '';
		const textMode = t.matchTextMode || 'exact';
		html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>元素CSS匹配</label><span class="auto-op-test-css-result" id="auto-op-test-css-result"></span><span style="margin-left:auto;display:flex;align-items:center;gap:6px"><button class="auto-op-test-btn" id="auto-op-test-btn">测试</button><label class="auto-op-switch"><input type="checkbox" data-info-action="toggle-enabled" ${t.enabled !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></span></div></div>`;
		html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>文字匹配</label><span class="auto-op-test-result" data-test-criterion="text"></span><label class="auto-op-switch"><input type="checkbox" data-info-action="toggle-matchText" ${t.matchText !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div><div class="auto-op-info-field"><span class="auto-op-info-field-label">文字模式</span><select data-info-action="change-matchTextMode"><option value="exact" ${textMode === 'exact' ? 'selected' : ''}>完全匹配</option><option value="fuzzy" ${textMode === 'fuzzy' ? 'selected' : ''}>模糊匹配</option></select></div><div class="auto-op-info-field"><span class="auto-op-info-field-label">文字内容</span><span class="auto-op-test-count" data-test-criterion="text"></span><input type="text" data-info-action="change-text" value="${(fp.text || '').replace(/"/g, '&quot;')}" placeholder="留空不匹配"></div></div>`;
		html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>标准属性匹配</label><span class="auto-op-test-result" data-test-criterion="attrs"></span><label class="auto-op-switch"><input type="checkbox" data-info-action="toggle-matchAttrs" ${t.matchAttrs !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div>`;
		if (attrKeys.length > 0) {
			html += '<div class="auto-op-info-attrs-list">';
			attrKeys.forEach(k => {
				html += `<div class="auto-op-info-attr-row"><span class="auto-op-info-attr-key" title="${k}">${k}</span><span class="auto-op-test-count" data-test-criterion="attrs"></span><input type="text" data-info-action="change-attr" data-attr-key="${k}" value="${(fp.attrs[k] || '').replace(/"/g, '&quot;')}" placeholder="留空不匹配"></div>`;
			});
			html += '</div>';
		} else {
			html += '<div class="auto-op-info-field"><span class="auto-op-test-count" data-test-criterion="attrs"></span><span class="auto-op-info-field-value">无特殊属性</span></div>';
		}
		html += '</div>';
		html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>标签匹配</label><span class="auto-op-test-result" data-test-criterion="tag"></span><label class="auto-op-switch"><input type="checkbox" data-info-action="toggle-matchTag" ${t.matchTag !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div><div class="auto-op-info-field"><span class="auto-op-info-field-label">标签名</span><span class="auto-op-test-count" data-test-criterion="tag"></span><span class="auto-op-info-field-value">${fp.tagName || '-'}</span></div></div>`;
		html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>id 匹配</label><span class="auto-op-test-result" data-test-criterion="id"></span><label class="auto-op-switch"><input type="checkbox" data-info-action="toggle-matchId" ${t.matchId !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div><div class="auto-op-info-field"><span class="auto-op-info-field-label">id</span><span class="auto-op-test-count" data-test-criterion="id"></span><span class="auto-op-info-field-value">${fp.id ? '#' + fp.id : '-'}</span></div></div>`;
		html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>class 匹配</label><span class="auto-op-test-result" data-test-criterion="class"></span><label class="auto-op-switch"><input type="checkbox" data-info-action="toggle-matchClass" ${t.matchClass !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div><div class="auto-op-info-field"><span class="auto-op-info-field-label">class</span><span class="auto-op-test-count" data-test-criterion="class"></span><span class="auto-op-info-field-value">${fp.className || '-'}</span></div></div>`;
		html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>data-* 属性匹配</label><span class="auto-op-test-result" data-test-criterion="dataAttrs"></span><label class="auto-op-switch"><input type="checkbox" data-info-action="toggle-matchDataAttrs" ${t.matchDataAttrs !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div>`;
		if (dataAttrKeys.length > 0) {
			html += '<div class="auto-op-info-attrs-list">';
			dataAttrKeys.forEach(k => {
				html += `<div class="auto-op-info-attr-row"><span class="auto-op-info-attr-key" title="${k}">${k}</span><span class="auto-op-test-count" data-test-criterion="dataAttrs"></span><input type="text" data-info-action="change-attr" data-attr-key="${k}" value="${(fp.dataAttrs[k] || '').replace(/"/g, '&quot;')}" placeholder="留空不匹配"></div>`;
			});
			html += '</div>';
		} else {
			html += '<div class="auto-op-info-field"><span class="auto-op-test-count" data-test-criterion="dataAttrs"></span><span class="auto-op-info-field-value">无 data-* 属性</span></div>';
		}
		html += '</div>';
		if (fp.onclickParam) {
			html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>onclick 匹配</label><span class="auto-op-test-result" data-test-criterion="onclick"></span><label class="auto-op-switch"><input type="checkbox" data-info-action="toggle-matchOnclick" ${t.matchOnclick !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div><div class="auto-op-info-field"><span class="auto-op-info-field-label">参数</span><span class="auto-op-test-count" data-test-criterion="onclick"></span><span class="auto-op-info-field-value">${fp.onclickParam}</span></div></div>`;
		}
		if (t.parentSelector) {
			html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>父级容器匹配</label><span class="auto-op-test-result" data-test-criterion="parent"></span><label class="auto-op-switch"><input type="checkbox" data-info-action="toggle-matchParent" ${t.matchParent !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div><div class="auto-op-info-field"><span class="auto-op-info-field-label">选择器</span><span class="auto-op-test-count" data-test-criterion="parent"></span><span class="auto-op-info-field-value">${t.parentSelector}</span></div></div>`;
		}
		html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>自动发现同类元素</label><span class="auto-op-test-result" data-test-criterion="autoDiscover"></span><label class="auto-op-switch"><input type="checkbox" data-info-action="toggle-autoDiscover" ${t.autoDiscover !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div></div>`;
		infoContentEl.innerHTML = html;
		infoOverlayEl.classList.remove('open');
		infoOverlayEl.style.display = 'flex';
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				fitBodyToOverlay(infoOverlayEl);
				infoOverlayEl.classList.add('open');
			});
		});
	}

	function hideInfoPanel(animate) {
		infoCurrentIndex = -1;
		clearTestHighlights();
		refreshParentHighlights();
		const c = cv();
		c.targets.forEach(t => {
			if (t.enableHighlight !== false && t.enabled !== false && t.element && t.element.classList && document.contains(t.element)) {
				t.element.classList.add('auto-op-selected-highlight');
			}
		});
		if (infoAnimTimer) {
			clearTimeout(infoAnimTimer);
			infoAnimTimer = null;
		}
		infoOverlayEl.removeEventListener('transitionend', onInfoCloseTransition);
		if (animate) {
			infoOverlayEl.style.display = 'flex';
			infoOverlayEl.addEventListener('transitionend', onInfoCloseTransition);
			restoreBodyHeight();
			updatePageHeight();
		}
		infoOverlayEl.classList.remove('open');
		if (!animate) {
			infoOverlayEl.style.display = 'none';
			restoreBodyHeight();
			updatePageHeight();
		}
	}

	function onInfoCloseTransition(e) {
		if (e.propertyName !== 'transform') return;
		infoOverlayEl.removeEventListener('transitionend', onInfoCloseTransition);
		infoOverlayEl.style.display = 'none';
	}
	const panelBody = panel.querySelector('.auto-op-body');
	let _bodyOrigMaxH = '';
	let _heightProbe = null;

	function fitBodyToOverlay(overlayEl) {
		if (!_bodyOrigMaxH) _bodyOrigMaxH = panelBody.style.maxHeight || getComputedStyle(panelBody).maxHeight;
		if (!_heightProbe) {
			_heightProbe = document.createElement('div');
			_heightProbe.style.cssText = 'position:fixed;left:-9999px;top:0;width:' + panelBody.offsetWidth + 'px;visibility:hidden;display:flex;flex-direction:column;font-size:12px;font-family:inherit';
			document.body.appendChild(_heightProbe);
		}
		_heightProbe.innerHTML = overlayEl.innerHTML;
		const mainHeader = panel.querySelector('.auto-op-header');
		let h = _heightProbe.scrollHeight;
		if (mainHeader) h -= mainHeader.offsetHeight;
		if (h > 0) {
			h = Math.min(h, window.innerHeight * 0.85);
			panelBody.style.minHeight = panelBody.offsetHeight + 'px';
			getComputedStyle(panelBody).minHeight;
			panelBody.style.minHeight = h + 'px';
			panelBody.style.maxHeight = h + 'px';
		}
	}

	function restoreBodyHeight() {
		const pageH = pageContainer.scrollHeight;
		if (pageH > 0 && pageH < panelBody.offsetHeight) {
			panelBody.style.minHeight = pageH + 'px';
		} else {
			panelBody.style.minHeight = '';
		}
		panelBody.style.maxHeight = '';
		_bodyOrigMaxH = '';
	}
	let settingsAnimTimer = null,
		settingsCurrentIndex = -1,
		_settingsCmdResizeObserver = null,
		_settingsCmdMutationObserver = null;

	function showSettingsPanel(index) {
		const c = cv();
		const t = c.targets[index];
		if (!t) return;
		settingsCurrentIndex = index;
		if (infoOverlayEl.classList.contains('open')) hideInfoPanel(false);
		if (networkOverlayEl.classList.contains('open')) hideNetworkOverlay(false);
		clearTestHighlights();
		if (settingsAnimTimer) {
			clearTimeout(settingsAnimTimer);
			settingsAnimTimer = null;
		}
		settingsOverlayEl.removeEventListener('transitionend', onSettingsCloseTransition);
		settingsTitleEl.textContent = t.desc || '元素设置';
		const isCmd = t.isCommand === true;
			const isInput = t.isInput || false;
		const customFill = t.customFill || '';
		let html = '';
		html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>启用此元素</label><label class="auto-op-switch"><input type="checkbox" data-settings-action="toggle-enabled" ${t.enabled !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div></div>`;
		html += `<div class="auto-op-info-section"><div class="auto-op-info-field"><span class="auto-op-info-field-label">元素描述</span><input type="text" data-settings-action="change-desc" value="${(t.desc || '').replace(/"/g, '&quot;')}" placeholder="元素描述"></div></div>`;
		if (isCmd) html += `<div class="auto-op-info-section"><div class="auto-op-info-field"><span class="auto-op-info-field-label">JS 指令</span><textarea data-settings-action="change-customCommand" placeholder="输入 JS 代码，$el 为当前元素" style="width:100%;box-sizing:border-box;background:var(--panel-input-bg)!important;border:1px solid var(--panel-input-border)!important;border-radius:4px;color:var(--panel-input-text)!important;font-family:Cascadia Code,Fira Code,Consolas,monospace;font-size:11px;padding:5px 8px;resize:vertical;min-height:60px;outline:none;line-height:1.4">${(t.customCommand || '').replace(/"/g, '&quot;')}</textarea></div></div>`;
			if (!isCmd) html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>输入元素</label><label class="auto-op-switch"><input type="checkbox" data-settings-action="toggle-isInput" ${isInput ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div><div id="auto-op-settings-fill-section" style="${isInput ? '' : 'display:none'}"><div class="auto-op-info-field"><span class="auto-op-info-field-label">填充文本</span><input type="text" data-settings-action="change-customFill" value="${customFill.replace(/"/g, '&quot;')}" placeholder="留空为清空"></div></div></div>`;
		html += `<div class="auto-op-info-section"><div class="auto-op-info-field"><span class="auto-op-info-field-label">独立间隔 (ms)</span><input type="number" data-settings-action="change-customInterval" value="${t.customInterval != null ? t.customInterval : ''}" min="0" placeholder="使用全局"></div></div>`;
		if (!isCmd) html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>启用高亮</label><label class="auto-op-switch"><input type="checkbox" data-settings-action="toggle-enableHighlight" ${t.enableHighlight !== false ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div></div>`;
		if (!isCmd) html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>滚动到可视区</label><label class="auto-op-switch"><input type="checkbox" data-settings-action="toggle-scrollIntoView" ${t.scrollIntoView ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div></div>`;
		if (!isCmd) html += `<div class="auto-op-info-section"><div class="auto-op-info-row-switch"><label>显示父级</label><label class="auto-op-switch"><input type="checkbox" data-settings-action="toggle-showParent" ${t.showParent ? 'checked' : ''}><span class="auto-op-switch-track"><span class="auto-op-switch-thumb"></span></span></label></div></div>`;
		settingsContentEl.innerHTML = html;
		settingsOverlayEl.classList.remove('open');
		settingsOverlayEl.style.display = 'flex';
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (_settingsCmdResizeObserver) { _settingsCmdResizeObserver.disconnect(); _settingsCmdResizeObserver = null; }
				if (_settingsCmdMutationObserver) { _settingsCmdMutationObserver.disconnect(); _settingsCmdMutationObserver = null; }
				settingsOverlayEl.classList.add('open');
				fitBodyToOverlay(settingsOverlayEl);
				if (isCmd) {
					const cmdTextarea = settingsContentEl.querySelector('textarea[data-settings-action="change-customCommand"]');
					if (cmdTextarea) {
						_settingsCmdResizeObserver = new ResizeObserver(() => {
							if (settingsOverlayEl.classList.contains('open')) fitBodyToOverlay(settingsOverlayEl);
						});
						_settingsCmdResizeObserver.observe(cmdTextarea);
						_settingsCmdMutationObserver = new MutationObserver(() => {
							if (settingsOverlayEl.classList.contains('open')) fitBodyToOverlay(settingsOverlayEl);
						});
						_settingsCmdMutationObserver.observe(cmdTextarea, { attributes: true, attributeFilter: ['style'] });
					}
				}
			});
		});
	}

	function hideSettingsPanel(animate) {
		settingsCurrentIndex = -1;
		if (_settingsCmdResizeObserver) { _settingsCmdResizeObserver.disconnect(); _settingsCmdResizeObserver = null; }
		if (_settingsCmdMutationObserver) { _settingsCmdMutationObserver.disconnect(); _settingsCmdMutationObserver = null; }
		if (settingsAnimTimer) {
			clearTimeout(settingsAnimTimer);
			settingsAnimTimer = null;
		}
		settingsOverlayEl.removeEventListener('transitionend', onSettingsCloseTransition);
		if (animate) {
			settingsOverlayEl.style.display = 'flex';
			settingsOverlayEl.addEventListener('transitionend', onSettingsCloseTransition);
			restoreBodyHeight();
			updatePageHeight();
		}
		settingsOverlayEl.classList.remove('open');
		if (!animate) {
			settingsOverlayEl.style.display = 'none';
			restoreBodyHeight();
			updatePageHeight();
		}
	}

	function onSettingsCloseTransition(e) {
		if (e.propertyName !== 'transform') return;
		settingsOverlayEl.removeEventListener('transitionend', onSettingsCloseTransition);
		settingsOverlayEl.style.display = 'none';
	}
	settingsContentEl.addEventListener('change', e => {
		if (settingsCurrentIndex < 0) return;
		const c = cv(),
			t = c.targets[settingsCurrentIndex];
		if (!t) return;
		const target = e.target,
			action = target.dataset.settingsAction;
		if (!action) return;
		switch (action) {
			case 'toggle-enabled':
				t.enabled = target.checked;
				break;
			case 'toggle-isInput': {
				t.isInput = target.checked;
				const fillSection = document.getElementById('auto-op-settings-fill-section');
				if (fillSection) fillSection.style.display = target.checked ? '' : 'none';
				break;
			}
			case 'toggle-enableHighlight':
				t.enableHighlight = target.checked;
				if (t.element && t.element.classList) {
					if (t.enableHighlight !== false) {
						t.element.classList.add('auto-op-selected-highlight');
					} else {
						t.element.classList.remove('auto-op-selected-highlight');
					}
				}
				if (t.enableHighlight === false) {
					if (t._blueParent && t._blueParent.classList) {
						t._blueParent.classList.remove('auto-op-parent-highlight');
						t._blueParent.classList.remove('auto-op-parent-highlight-Overlap');
					}
					if (t._nearestEl && t._nearestEl.classList) t._nearestEl.classList.remove('auto-op-nearest-parent-highlight');
				}
				refreshParentHighlights();
				break;
			case 'toggle-scrollIntoView':
				t.scrollIntoView = target.checked;
				break;
			case 'toggle-showParent':
				t.showParent = target.checked;
				break;
		}
		t._isValid = !!t.element && document.contains(t.element) && matchesFingerprint(t.element, t);
		updateTargetUI();
		updateTargetCount();
		savePerConfig(activeConfig);
		refreshSettingsHeight();
	});
	settingsContentEl.addEventListener('input', e => {
		if (settingsCurrentIndex < 0) return;
		const c = cv(),
			t = c.targets[settingsCurrentIndex];
		if (!t) return;
		const target = e.target,
			action = target.dataset.settingsAction;
		if (action === 'change-desc') {
			t.desc = target.value;
			settingsTitleEl.textContent = t.desc || '元素设置';
		} else if (action === 'change-customFill') {
			t.customFill = target.value;
		} else if (action === 'change-customCommand') {
				t.customCommand = target.value;
			} else if (action === 'change-customInterval') {
			const val = target.value;
			t.customInterval = val === '' ? undefined : Number(val);
		}
		updateTargetUI();
		savePerConfig(activeConfig);
	});

	function clearTestHighlights() {
		_testHighlightedElements.forEach(el => {
			if (el && el.classList) el.classList.remove('auto-op-test-highlight');
		});
		_testHighlightedElements = [];
		const results = infoContentEl.querySelectorAll('.auto-op-test-result, .auto-op-test-css-result');
		results.forEach(r => {
			r.textContent = '';
			r.className = r.className.replace(/\s*(pass|fail|disabled)/g, '');
		});
		const counts = infoContentEl.querySelectorAll('.auto-op-test-count');
		counts.forEach(c => {
			c.textContent = '';
			c.className = c.className.replace(/\s*zero/g, '');
		});
	}

	function runElementTest() {
		if (infoCurrentIndex < 0) return;
		const c = cv(),
			t = c.targets[infoCurrentIndex];
		if (!t || !t.fingerprint) return;
		clearTestHighlights();
		const fp = t.fingerprint;
		const cssResult = document.getElementById('auto-op-test-css-result');
		const isEnabled = t.enabled !== false;
		if (!isEnabled) {
			if (cssResult) {
				cssResult.textContent = '⊘';
				cssResult.className = 'auto-op-test-css-result disabled';
			}
			infoContentEl.querySelectorAll('.auto-op-test-result').forEach(el => {
				el.textContent = '⊘';
				el.className = 'auto-op-test-result disabled';
			});
			return;
		}

		function setResult(criterion, found, count) {
			const el = infoContentEl.querySelector(`.auto-op-test-result[data-test-criterion="${criterion}"]`);
			if (el) {
				el.textContent = found ? `✓ ${count}` : '✕';
				el.className = `auto-op-test-result ${found ? 'pass' : 'fail'}`;
			}
		}

		function setCount(criterion, count) {
			const els = infoContentEl.querySelectorAll(`.auto-op-test-count[data-test-criterion="${criterion}"]`);
			els.forEach(el => {
				el.textContent = count > 0 ? count : '';
				el.className = `auto-op-test-count${count === 0 ? ' zero' : ''}`;
			});
		}
		infoContentEl.querySelectorAll('.auto-op-test-result').forEach(el => {
			el.textContent = '⊘';
			el.className = el.className.replace(/\s*(pass|fail|disabled)/g, '') + ' disabled';
		});
		let cssFound = false,
			cssCount = 0,
			cssElements = [];
		try {
			if (t.strict) {
				const els = document.querySelectorAll(t.strict);
				cssElements = Array.from(els).filter(e => !panel.contains(e));
				if (cssElements.length > 0) {
					cssFound = true;
					cssCount = cssElements.length;
				}
			}
			if (!cssFound && t.loose) {
				const els = document.querySelectorAll(t.loose);
				cssElements = Array.from(els).filter(e => !panel.contains(e));
				if (cssElements.length > 0) {
					cssFound = true;
					cssCount = cssElements.length;
				}
			}
			if (!cssFound && fp.tagName) {
				const els = document.querySelectorAll(fp.tagName);
				cssElements = Array.from(els).filter(e => !panel.contains(e));
				cssCount = cssElements.length;
			}
		} catch (e) {}
		if (cssResult) {
			cssResult.textContent = cssFound ? `✓ ${cssCount}` : '✕';
			cssResult.className = `auto-op-test-css-result ${cssFound ? 'pass' : 'fail'}`;
		}
		cssElements.forEach(el => {
			el.classList.add('auto-op-test-highlight');
			_testHighlightedElements.push(el);
		});
		if (t.matchTag !== false && fp.tagName) {
			const els = Array.from(document.querySelectorAll(fp.tagName)).filter(e => !panel.contains(e));
			setResult('tag', els.length > 0, els.length);
			setCount('tag', els.length);
			els.forEach(el => {
				el.classList.add('auto-op-test-highlight');
				_testHighlightedElements.push(el);
			});
		}
		if (t.matchId !== false && fp.id) {
			const el = document.getElementById(fp.id);
			const found = el && !panel.contains(el);
			setResult('id', found, found ? 1 : 0);
			setCount('id', found ? 1 : 0);
			if (found) {
				el.classList.add('auto-op-test-highlight');
				_testHighlightedElements.push(el);
			}
		}
		if (t.matchClass !== false && fp.className) {
			const fpClasses = fp.className.split(/\s+/).filter(Boolean);
			if (fpClasses.length > 0) {
				const els = Array.from(document.querySelectorAll(fp.tagName || '*')).filter(e => !panel.contains(e) && typeof e.className === 'string' && fpClasses.every(c => e.className.split(/\s+/).includes(c)));
				setResult('class', els.length > 0, els.length);
				setCount('class', els.length);
				els.forEach(el => {
					el.classList.add('auto-op-test-highlight');
					_testHighlightedElements.push(el);
				});
			}
		}
		if (t.matchAttrs !== false && Object.keys(fp.attrs || {}).some(k => fp.attrs[k])) {
			let sel = fp.tagName || '*';
			for (const [k, v] of Object.entries(fp.attrs)) {
				if (v) sel += `[${k}="${v.replace(/"/g, '\\"')}"]`;
			}
			try {
				const els = Array.from(document.querySelectorAll(sel)).filter(e => !panel.contains(e));
				setResult('attrs', els.length > 0, els.length);
				setCount('attrs', els.length);
				els.forEach(el => {
					el.classList.add('auto-op-test-highlight');
					_testHighlightedElements.push(el);
				});
			} catch (e) {
				setResult('attrs', false, 0);
				setCount('attrs', 0);
			}
		}
		if (t.matchDataAttrs !== false && Object.keys(fp.dataAttrs || {}).some(k => fp.dataAttrs[k])) {
			let sel = fp.tagName || '*';
			for (const [k, v] of Object.entries(fp.dataAttrs)) {
				if (v) sel += `[${k}="${v.replace(/"/g, '\\"')}"]`;
			}
			try {
				const els = Array.from(document.querySelectorAll(sel)).filter(e => !panel.contains(e));
				setResult('dataAttrs', els.length > 0, els.length);
				setCount('dataAttrs', els.length);
				els.forEach(el => {
					el.classList.add('auto-op-test-highlight');
					_testHighlightedElements.push(el);
				});
			} catch (e) {
				setResult('dataAttrs', false, 0);
				setCount('dataAttrs', 0);
			}
		}
		if (t.matchOnclick !== false && fp.onclickParam) {
			const els = Array.from(document.querySelectorAll('[onclick]')).filter(e => !panel.contains(e) && (e.getAttribute('onclick') || '').includes(fp.onclickParam));
			setResult('onclick', els.length > 0, els.length);
			setCount('onclick', els.length);
			els.forEach(el => {
				el.classList.add('auto-op-test-highlight');
				_testHighlightedElements.push(el);
			});
		}
		if (t.matchParent !== false && t.parentSelector) {
			try {
				const els = Array.from(document.querySelectorAll(t.parentSelector)).filter(e => !panel.contains(e));
				setResult('parent', els.length > 0, els.length);
				setCount('parent', els.length);
			} catch (e) {
				setResult('parent', false, 0);
				setCount('parent', 0);
			}
		}
		if (t.autoDiscover !== false && t.parentSelector) {
			try {
				const parent = document.querySelector(t.parentSelector);
				if (parent) {
					let candidates = parent.querySelectorAll(t.loose || t.strict || fp.tagName);
					const matched = Array.from(candidates).filter(el => !panel.contains(el) && matchesFingerprint(el, t));
					setResult('autoDiscover', matched.length > 0, matched.length);
				} else {
					setResult('autoDiscover', false, 0);
				}
			} catch (e) {
				setResult('autoDiscover', false, 0);
			}
		}
		if (t.matchText !== false && fp.text) {
			const els = Array.from(document.querySelectorAll(fp.tagName || '*')).filter(e => !panel.contains(e));
			let matched;
			const textMode = t.matchTextMode || 'exact';
			if (textMode === 'fuzzy') {
				matched = els.filter(e => {
					const txt = getElText(e);
					return txt && txt.includes(fp.text);
				});
			} else {
				matched = els.filter(e => {
					const txt = getElText(e);
					return txt === fp.text;
				});
			}
			setResult('text', matched.length > 0, matched.length);
			setCount('text', matched.length);
			matched.forEach(el => {
				el.classList.add('auto-op-test-highlight');
				_testHighlightedElements.push(el);
			});
		}
		refreshInfoHeight();
	}
	infoContentEl.addEventListener('click', e => {
		const btn = e.target.closest('#auto-op-test-btn');
		if (!btn) return;
		e.stopPropagation();
		runElementTest();
	});
	infoContentEl.addEventListener('change', e => {
		if (infoCurrentIndex < 0) return;
		const c = cv(),
			t = c.targets[infoCurrentIndex];
		if (!t) return;
		const target = e.target,
			action = target.dataset.infoAction;
		if (!action) return;
		switch (action) {
			case 'toggle-enabled':
				t.enabled = target.checked;
				break;
			case 'toggle-matchTag':
				t.matchTag = target.checked;
				break;
			case 'toggle-matchText':
				t.matchText = target.checked;
				break;
			case 'change-matchTextMode':
				t.matchTextMode = target.value;
				break;
			case 'toggle-matchAttrs':
				t.matchAttrs = target.checked;
				break;
			case 'toggle-matchDataAttrs':
				t.matchDataAttrs = target.checked;
				break;
			case 'toggle-matchOnclick':
				t.matchOnclick = target.checked;
				break;
			case 'toggle-matchId':
				t.matchId = target.checked;
				break;
			case 'toggle-matchClass':
				t.matchClass = target.checked;
				break;
			case 'toggle-matchParent':
				t.matchParent = target.checked;
				break;
			case 'toggle-autoDiscover':
				t.autoDiscover = target.checked;
				break;
		}
		clearTestHighlights();
		t._isValid = !!t.element && document.contains(t.element) && matchesFingerprint(t.element, t);
		updateTargetUI();
		updateTargetCount();
		savePerConfig(activeConfig);
		refreshInfoHeight();
	});
	infoContentEl.addEventListener('input', e => {
		if (infoCurrentIndex < 0) return;
		const c = cv(),
			t = c.targets[infoCurrentIndex];
		if (!t) return;
		const target = e.target,
			action = target.dataset.infoAction;
		if (action === 'change-text') {
			t.fingerprint.text = target.value;
		} else if (action === 'change-attr') {
			const key = target.dataset.attrKey;
			if (key && t.fingerprint) {
				if (key.startsWith('data-')) {
					if (!t.fingerprint.dataAttrs) t.fingerprint.dataAttrs = {};
					t.fingerprint.dataAttrs[key] = target.value;
				} else {
					if (!t.fingerprint.attrs) t.fingerprint.attrs = {};
					t.fingerprint.attrs[key] = target.value;
				}
			}
		}
		t._isValid = !!t.element && document.contains(t.element) && matchesFingerprint(t.element, t);
		if (action === 'change-text') {
			updateTargetUI();
		}
		updateTargetCount();
		savePerConfig(activeConfig);
	});
	infoBackBtn.addEventListener('click', e => {
		e.stopPropagation();
		hideInfoPanel(true);
	});
	settingsBackBtn.addEventListener('click', e => {
		e.stopPropagation();
		hideSettingsPanel(true);
	});

	function updateTargetUI() {
		if (isPowerSave) return;
		const c = cv();
		if (c.targets.length === 0) {
			targetListContainer.innerHTML = '<div class="auto-op-target-info">未选取，请点击下方按钮选取</div>';
			btnClearAll.style.display = 'none';
			btnStart.disabled = true;
			btnHeaderStart.disabled = true;
			updateCmdTargetBtn();
			return;
		}
		btnClearAll.style.display = 'inline-block';
		btnStart.disabled = false;
		btnHeaderStart.disabled = false;
		let html = '';
		c.targets.forEach((t, i) => {
			const isDisabled = t.enabled === false;
			const isCmd = t.isCommand === true;
			const isValid = isCmd ? true : (t._isValid !== undefined ? t._isValid : (t.element && document.contains(t.element)));
			let stateClass = 'active';
			if (isCmd) { stateClass += ' cmd-target'; if (t.commandError) stateClass += ' cmd-error'; }
			if (isDisabled) stateClass = 'disabled';
			else if (!isValid) stateClass = 'missing';
			html += `<div class="auto-op-target-item ${stateClass}" data-index="${i}"><span>${c.isMultiMode ? (i + 1) + '. ' : ''}${t.desc}</span>${t.showParent && t.parentChain ? t.parentChain.map(p => '<span class="auto-op-target-parent">└> ' + p.desc + '</span>').join('') : ''}${c.targets.length > 1 ? `<button class="auto-op-btn-move auto-op-btn-move-up"data-action="move-up"data-index="${i}"title="上移"><svg viewBox="0 0 1375.2 1375.2"fill="none"aria-hidden="true"style="width:10px;height:10px;display:block;transform:rotate(90deg)"><path d="M321.6 626.1 H1210.6 Q1233.6 626.1 1247.1 639.1 Q1260.6 652.1 1260.6 675.1 V702.1 Q1260.6 723.1 1247.1 735.6 Q1233.6 748.1 1210.6 748.1 H321.6 L574.6 1001.1 Q590.6 1016.1 590.6 1033.6 Q590.6 1051.1 572.6 1069.1 L556.6 1086.1 Q539.6 1104.1 521.6 1103.6 Q503.6 1103.1 486.6 1086.1 L139.6 738.1 Q115.6 714.1 115.1 687.1 Q114.6 660.1 140.6 635.1 L486.6 289.1 Q503.6 272.1 520.6 271.6 Q537.6 271.1 555.6 289.1 L574.6 308.1 Q591.6 324.1 591.6 340.6 Q591.6 357.1 573.6 374.1 Z"transform="matrix(1 0 0 -1 0 1375.2)"fill="currentColor"fill-rule="nonzero"clip-rule="nonzero"></path></svg></button><button class="auto-op-btn-move auto-op-btn-move-down"data-action="move-down"data-index="${i}"title="下移"><svg viewBox="0 0 1375.2 1375.2"fill="none"aria-hidden="true"style="width:10px;height:10px;display:block;transform:rotate(-90deg)"><path d="M321.6 626.1 H1210.6 Q1233.6 626.1 1247.1 639.1 Q1260.6 652.1 1260.6 675.1 V702.1 Q1260.6 723.1 1247.1 735.6 Q1233.6 748.1 1210.6 748.1 H321.6 L574.6 1001.1 Q590.6 1016.1 590.6 1033.6 Q590.6 1051.1 572.6 1069.1 L556.6 1086.1 Q539.6 1104.1 521.6 1103.6 Q503.6 1103.1 486.6 1086.1 L139.6 738.1 Q115.6 714.1 115.1 687.1 Q114.6 660.1 140.6 635.1 L486.6 289.1 Q503.6 272.1 520.6 271.6 Q537.6 271.1 555.6 289.1 L574.6 308.1 Q591.6 324.1 591.6 340.6 Q591.6 357.1 573.6 374.1 Z"transform="matrix(1 0 0 -1 0 1375.2)"fill="currentColor"fill-rule="nonzero"clip-rule="nonzero"></path></svg></button>` : ''}<button class="auto-op-btn-item-del" data-action="delete" data-index="${i}"><svg viewBox="0 0 1306.8 1306.8" fill="none" aria-hidden="true" style="width:10px;height:10px;display:block"><path d="M920.9 123.9 Q964.9 144.9 987.9 185.9 Q999.9 206.9 1004.4 236.4 Q1008.9 265.9 1012.9 330.9 L1054.9 913.9 H1114.9 Q1130.9 913.9 1141.9 925.4 Q1152.9 936.9 1152.9 953.9 V982.9 Q1152.9 999.9 1141.4 1011.4 Q1129.9 1022.9 1114.9 1022.9 H935.9 Q915.9 1022.9 908.9 1026.9 Q901.9 1030.9 893.9 1047.9 L871.9 1095.9 L861.9 1115.9 Q854.9 1130.9 847.9 1143.4 Q840.9 1155.9 832.9 1163.9 Q813.9 1182.9 788.9 1191.9 Q775.9 1195.9 755.9 1196.9 Q735.9 1197.9 709.9 1197.9 H596.9 Q570.9 1197.9 551.4 1196.9 Q531.9 1195.9 518.9 1191.9 Q492.9 1182.9 473.9 1163.9 Q464.9 1153.9 455.4 1136.4 Q445.9 1118.9 434.9 1095.9 L409.9 1042.9 Q402.9 1028.9 396.9 1025.9 Q390.9 1022.9 369.9 1022.9 H193.9 Q178.9 1022.9 166.4 1011.9 Q153.9 1000.9 153.9 979.9 V955.9 Q153.9 935.9 166.4 924.9 Q178.9 913.9 193.9 913.9 H242.9 L282.9 331.9 Q286.9 266.9 291.4 236.9 Q295.9 206.9 307.9 185.9 Q332.9 143.9 374.9 123.9 Q396.9 113.9 426.9 111.4 Q456.9 108.9 522.9 108.9 H773.9 Q839.9 108.9 869.4 111.4 Q898.9 113.9 920.9 123.9 Z M429.9 225.9 Q413.9 232.9 404.9 249.9 Q399.9 257.9 397.9 274.4 Q395.9 290.9 393.9 314.9 L351.9 913.9 H945.9 L903.9 323.9 Q901.9 294.9 899.9 276.4 Q897.9 257.9 892.9 249.9 Q883.9 232.9 867.9 225.9 Q858.9 221.9 842.4 220.9 Q825.9 219.9 801.9 219.9 H495.9 Q470.9 219.9 454.9 220.9 Q438.9 221.9 429.9 225.9 Z M609.9 374.9 L594.9 784.9 Q593.9 798.9 584.9 807.4 Q575.9 815.9 561.9 815.9 H518.9 Q503.9 815.9 494.4 806.9 Q484.9 797.9 485.9 782.9 L501.9 372.9 Q502.9 357.9 511.4 349.4 Q519.9 340.9 534.9 340.9 H576.9 Q591.9 340.9 601.4 349.9 Q610.9 358.9 609.9 374.9 Z M795.9 372.9 L811.9 782.9 Q812.9 797.9 803.4 806.9 Q793.9 815.9 778.9 815.9 H735.9 Q721.9 815.9 712.9 807.4 Q703.9 798.9 702.9 784.9 L687.9 374.9 Q686.9 358.9 696.4 349.9 Q705.9 340.9 720.9 340.9 H762.9 Q777.9 340.9 786.4 349.4 Q794.9 357.9 795.9 372.9 Z M526.9 1031.9 L540.9 1059.9 Q549.9 1077.9 559.4 1082.9 Q568.9 1087.9 590.9 1087.9 H715.9 Q738.9 1087.9 747.9 1082.9 Q756.9 1077.9 764.9 1060.9 L779.9 1030.9 Q781.9 1027.9 780.4 1025.4 Q778.9 1022.9 774.9 1022.9 H531.9 Q527.9 1022.9 526.4 1025.4 Q524.9 1027.9 526.9 1031.9 Z" transform="matrix(1 0 0 -1 0 1306.8)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button><button class="auto-op-btn-info" data-action="info" data-index="${i}" title="匹配规则"><svg viewBox="0 0 1186.2 1186.2" fill="none" aria-hidden="true" style="width:12px;height:12px;display:block"><path d="M363.2 1047.8 L246.5 929.5 Q240.9 924.5 237.0 924.3 Q233.1 924.1 227.1 930.1 L184.0 973.8 Q174.2 984.1 159.9 985.6 Q145.6 987.1 133.2 974.8 L112.2 953.8 Q98.8 940.4 99.8 927.2 Q100.8 913.9 111.2 903.0 L194.2 820.0 Q215.6 799.2 237.6 799.4 Q259.6 799.6 284.0 823.0 L437.0 976.0 Q449.3 988.9 449.8 1004.2 Q450.3 1019.4 438.0 1030.8 L418.0 1050.8 Q404.6 1063.1 390.1 1061.6 Q375.6 1060.1 363.2 1047.8 Z M1087.3 561.9 V591.9 Q1087.3 610.4 1076.2 619.3 Q1065.0 628.1 1048.1 628.1 H549.6 Q533.0 628.1 522.0 618.8 Q510.9 609.4 510.9 592.9 V562.9 Q510.9 544.3 521.8 535.0 Q532.6 525.6 549.6 525.6 H1048.1 Q1065.0 525.6 1076.2 534.5 Q1087.3 543.3 1087.3 561.9 Z M1087.3 898.9 V928.9 Q1087.3 947.4 1076.2 956.3 Q1065.0 965.1 1048.1 965.1 H549.6 Q533.0 965.1 522.0 955.8 Q510.9 946.4 510.9 929.9 V899.9 Q510.9 881.3 521.8 872.0 Q532.6 862.6 549.6 862.6 H1048.1 Q1065.0 862.6 1076.2 871.5 Q1087.3 880.3 1087.3 898.9 Z M1087.3 223.9 V253.9 Q1087.3 272.4 1076.2 281.3 Q1065.0 290.1 1048.1 290.1 H549.6 Q533.0 290.1 522.0 280.8 Q510.9 271.4 510.9 254.9 V224.9 Q510.9 206.3 521.8 197.0 Q532.6 187.6 549.6 187.6 H1048.1 Q1065.0 187.6 1076.2 196.5 Q1087.3 205.3 1087.3 223.9 Z M363.2 710.6 L246.5 592.9 Q241.5 587.9 237.3 587.4 Q233.1 586.9 227.1 592.9 L184.0 636.6 Q174.2 646.9 159.9 648.4 Q145.6 649.9 133.2 637.6 L112.2 616.6 Q98.8 603.2 99.8 590.0 Q100.8 576.8 111.2 566.4 L194.2 483.4 Q215.0 462.1 237.3 462.3 Q259.6 462.5 284.0 486.4 L437.0 639.4 Q449.3 651.8 449.8 667.0 Q450.3 682.2 438.0 693.6 L418.0 713.6 Q404.6 725.9 390.1 724.4 Q375.6 722.9 363.2 710.6 Z M363.2 372.2 L246.5 253.9 Q240.9 248.9 237.0 248.7 Q233.1 248.5 227.1 254.5 L184.0 298.2 Q174.2 308.5 159.9 310.0 Q145.6 311.5 133.2 299.2 L112.2 278.2 Q98.8 264.8 99.8 251.6 Q100.8 238.3 111.2 227.4 L194.2 144.4 Q215.6 123.1 237.6 123.3 Q259.6 123.5 284.0 147.4 L437.0 300.4 Q449.3 313.3 449.8 328.6 Q450.3 343.8 438.0 355.2 L418.0 375.2 Q404.6 387.5 390.1 386.0 Q375.6 384.5 363.2 372.2 Z" transform="matrix(1 0 0 -1 0 1186.2)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button><button class="auto-op-btn-settings" data-action="settings" data-index="${i}" title="元素设置"><svg viewBox="0 0 1224 1224" fill="none" aria-hidden="true" style="width:12px;height:12px;display:block"><path d="M875.0 670.5 V697.5 Q875.0 722.5 864.0 734.0 Q853.0 745.5 830.0 745.5 H395.0 Q373.0 745.5 362.0 733.5 Q351.0 721.5 351.0 697.5 V670.5 Q351.0 646.5 362.0 635.0 Q373.0 623.5 395.0 623.5 H830.0 Q853.0 623.5 864.0 635.0 Q875.0 646.5 875.0 670.5 Z M668.0 452.5 V479.5 Q668.0 503.5 657.0 515.5 Q646.0 527.5 623.0 527.5 H395.0 Q373.0 527.5 362.0 515.5 Q351.0 503.5 351.0 479.5 V452.5 Q351.0 428.5 362.0 417.0 Q373.0 405.5 395.0 405.5 H623.0 Q646.0 405.5 657.0 417.0 Q668.0 428.5 668.0 452.5 Z M1024.0 154.5 Q1077.0 183.5 1102.0 233.5 Q1116.0 260.5 1119.0 297.0 Q1122.0 333.5 1122.0 414.5 V809.5 Q1122.0 890.5 1119.0 927.0 Q1116.0 963.5 1102.0 990.5 Q1089.0 1015.5 1069.0 1036.0 Q1049.0 1056.5 1024.0 1069.5 Q997.0 1082.5 960.5 1085.5 Q924.0 1088.5 843.0 1088.5 H381.0 Q300.0 1088.5 263.5 1085.5 Q227.0 1082.5 200.0 1069.5 Q175.0 1056.5 155.0 1036.0 Q135.0 1015.5 122.0 990.5 Q108.0 963.5 105.0 927.0 Q102.0 890.5 102.0 809.5 V414.5 Q102.0 333.5 105.0 297.0 Q108.0 260.5 122.0 233.5 Q147.0 183.5 200.0 154.5 Q227.0 141.5 263.5 138.5 Q300.0 135.5 381.0 135.5 H843.0 Q924.0 135.5 960.5 138.5 Q997.0 141.5 1024.0 154.5 Z M261.0 266.5 Q244.0 274.5 234.0 293.5 Q230.0 302.5 228.5 317.0 Q227.0 331.5 227.0 365.5 V728.5 Q227.0 762.5 228.5 777.0 Q230.0 791.5 234.0 800.5 Q243.0 817.5 261.0 826.5 Q269.0 831.5 282.5 832.5 Q296.0 833.5 333.0 833.5 H891.0 Q928.0 833.5 941.5 832.5 Q955.0 831.5 963.0 826.5 Q981.0 817.5 990.0 800.5 Q994.0 791.5 995.5 776.5 Q997.0 761.5 997.0 728.5 V364.5 Q997.0 330.5 995.5 316.5 Q994.0 302.5 990.0 293.5 Q980.0 274.5 963.0 266.5 Q955.0 262.5 937.0 261.5 Q919.0 260.5 891.0 260.5 H333.0 Q305.0 260.5 287.0 261.5 Q269.0 262.5 261.0 266.5 Z" transform="matrix(1 0 0 -1 0 1224)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button></div>`;
		});
		targetListContainer.innerHTML = '<div class="auto-op-target-list">' + html + '</div>';
		updateTargetCount();
		updateCmdTargetBtn();
	}

	function updateTargetCount(status) {
		if (isPowerSave) return;
		const c = cv();
		if (!status) {
			let existCount = 0,
				missingCount = 0;
			for (const t of c.targets) {
				if (t.element && document.contains(t.element) && t._isValid) existCount++;
				else missingCount++;
			}
			targetCountSpan.innerHTML = '[<span class="auto-op-target-count-exist">' + existCount + '</span>/<span class="auto-op-target-count-missing">' + missingCount + '</span>/<span class="auto-op-target-count-total">' + c.targets.length + '</span>]';
			return;
		}
		let existCount = status.filter(s => s && s !== 'disabled').length;
		targetCountSpan.innerHTML = '[<span class="auto-op-target-count-exist">' + existCount + '</span>/<span class="auto-op-target-count-missing">' + (status.length - existCount) + '</span>/<span class="auto-op-target-count-total">' + c.targets.length + '</span>]';
	}

	function updateTargetItemStyle(index, state) {
		if (isPowerSave) return;
		const c = cv();
		if (c.uiThrottled) return;
		const item = targetListContainer.querySelector(`.auto-op-target-item[data-index="${index}"]`);
		if (!item) return;
		item.classList.remove('active', 'missing', 'disabled');
		if (state === true) {
			item.classList.add('missing');
		} else if (state === false) {
			item.classList.add('active');
		} else if (state === null) {
			item.classList.add('disabled');
		}
	}

	function updateRunningDisplay(ci, countText, stateText) {
		if (isPowerSave || ci !== activeConfig) return;
		countSpan.textContent = countText;
		stateSpan.textContent = stateText;
		stateSpan.classList.remove('auto-op-waiting');
	}
	let isDragging = false,
		dragOffX = 0,
		dragOffY = 0;

	function getEventPos(e) {
		return e.touches && e.touches.length > 0 ? {
			x: e.touches[0].clientX,
			y: e.touches[0].clientY
		} : {
			x: e.clientX,
			y: e.clientY
		};
	}

	function onDragStart(e) {
    if (e.target === toggleBtn || toggleBtn.contains(e.target) || 
        e.target === btnHeaderStart || btnHeaderStart.contains(e.target) || 
        e.target === configBtnEl || configBtnEl.contains(e.target) || 
        e.target === infoBackBtn || infoBackBtn.contains(e.target) || 
        e.target === settingsBackBtn || settingsBackBtn.contains(e.target) || 
        e.target === networkBackBtn || networkBackBtn.contains(e.target) || 
        e.target === networkToggle || networkToggle.contains(e.target) ||
        e.target.closest('.auto-op-switch')) return;
        isDragging = true;
		closeConfigMenu();
		const pos = getEventPos(e),
			rect = panel.getBoundingClientRect();
		dragOffX = pos.x - rect.left;
		dragOffY = pos.y - rect.top;
		e.preventDefault();
	}

	function onDragMove(e) {
		if (!isDragging) return;
		const pos = getEventPos(e);
		panel.style.left = (pos.x - dragOffX) + 'px';
		panel.style.top = (pos.y - dragOffY) + 'px';
		panel.style.right = 'auto';
		e.preventDefault();
	}

	function onDragEnd() {
		isDragging = false;
	}
	dragHandle.addEventListener('mousedown', onDragStart);
	document.addEventListener('mousemove', onDragMove);
	document.addEventListener('mouseup', onDragEnd);
	dragHandle.addEventListener('touchstart', onDragStart, {
		passive: false
	});
	document.addEventListener('touchmove', onDragMove, {
		passive: false
	});
	document.addEventListener('touchend', onDragEnd);
	const networkHeader = networkOverlay.querySelector('.auto-op-network-header');
	networkHeader.addEventListener('mousedown', onDragStart);
	networkHeader.addEventListener('touchstart', onDragStart, {
		passive: false
	});
	document.addEventListener('touchcancel', onDragEnd);
	const infoDragHandle = infoOverlayEl.querySelector('.auto-op-info-panel-header');
	infoDragHandle.addEventListener('mousedown', onDragStart);
	infoDragHandle.addEventListener('touchstart', onDragStart, {
		passive: false
	});
	const settingsDragHandle = settingsOverlayEl.querySelector('.auto-op-settings-panel-header');
	settingsDragHandle.addEventListener('mousedown', onDragStart);
	settingsDragHandle.addEventListener('touchstart', onDragStart, {
		passive: false
	});
	toggleBtn.addEventListener('click', e => {
		e.stopPropagation();
		onPanelClickRestore();
		if (collapseAnimPhase === 'collapsing' || collapseAnimPhase === 'expanding') return;
		if (collapseAnimPhase !== 'collapsed') performCollapse();
		else performExpand();
	});
	multiModeCheckbox.addEventListener('change', e => {
		const c = cv();
		c.isMultiMode = e.target.checked;
		strategyRow.style.display = c.isMultiMode ? 'block' : 'none';
		updateCmdTargetBtn();
		c.clickStrategy = strategySelect.value;
		clearSelection();
		savePerConfig(activeConfig);
	});
	strategySelect.addEventListener('change', e => {
		cv().clickStrategy = e.target.value;
		savePerConfig(activeConfig);
	});
	[clickIntervalInput, maxClicksInput, missingActionSelect].forEach(el => {
		el.addEventListener('change', () => savePerConfig(activeConfig));
	});
	maxDurationInput.addEventListener('change', e => {
		let val = parseFloat(e.target.value);
		const c = cv();
		if (isNaN(val) || val <= 0) {
			c.maxDurationMin = 0;
			e.target.value = '';
		} else {
			c.maxDurationMin = val;
		}
		savePerConfig(activeConfig);
	});
	autoStartIntervalInput.addEventListener('change', e => {
		e.stopPropagation();
		setupAutoStartFromInput();
	});
	autoRefreshCheckbox.addEventListener('change', e => {
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
			const remainingSec = Math.ceil(Math.max(0, refreshIntervalSec * 1000 - (Date.now() - refreshStartTimestamp)) / 1000);
			stopAutoRefreshCountdown();
			addRefreshLog('自动刷新关闭 ✕ [' + remainingSec + 's]');
		}
		saveShared();
	});
	refreshIntervalInput.addEventListener('change', e => {
		e.stopPropagation();
		let val = parseInt(e.target.value, 10);
		if (isNaN(val) || val < 10) val = 10;
		if (val > 86400) val = 86400;
		e.target.value = val;
		refreshIntervalSec = val;
		if (isAutoRefresh) startAutoRefreshCountdown(true);
		saveShared();
	});
	btnClearLog.addEventListener('click', e => {
		e.stopPropagation();
		refreshLogs = [];
		updateLogUI();
		saveShared();
	});
	let resetConfirmTimer = null;
	resetBtn.addEventListener('click', e => {
		e.stopPropagation();
		if (!resetConfirm) {
			resetConfirm = true;
			resetBtn.textContent = '再次点击确认恢复默认设置';
			resetBtn.classList.add('confirm');
			if (resetConfirmTimer) clearTimeout(resetConfirmTimer);
			resetConfirmTimer = setTimeout(() => {
				resetConfirm = false;
				resetBtn.textContent = '恢复默认设置';
				resetBtn.classList.remove('confirm');
				resetConfirmTimer = null;
			}, 5000);
		} else {
			if (resetConfirmTimer) { clearTimeout(resetConfirmTimer); resetConfirmTimer = null; }
			try {
				const keys = [];
				for (let i = 0; i < localStorage.length; i++) {
					const k = localStorage.key(i);
					if (k && (k.startsWith('AUTO_OP_') || k.startsWith('AUTO_OP'))) keys.push(k);
				}
				keys.forEach(k => localStorage.removeItem(k));
			} catch (err) {
				console.error('[AUTO_OP] 重置失败:', err);
			}
			location.reload();
		}
	});
	wakeLockCheckbox.addEventListener('change', e => {
		e.stopPropagation();
		if (e.target.checked) requestWakeLock();
		else releaseWakeLock();
		saveShared();
	});
	suppressFocusCheckbox.addEventListener('change', e => {
		e.stopPropagation();
		if (e.target.checked) suppressFocus();
		else restoreFocus();
		saveShared();
	});
	pickPassThroughCheckbox.addEventListener('change', e => {
		e.stopPropagation();
		pickPassThrough = e.target.checked;
		saveShared();
	});
	panelFontSelect.addEventListener('change', e => {
		e.stopPropagation();
		panelFont = e.target.value;
		document.documentElement.style.setProperty('--auto-op-font', `"${panelFont}", system-ui`);
		saveShared();
	});
	themeModeSelect.addEventListener('change', e => {
		e.stopPropagation();
		themeMode = e.target.value;
		applyTheme();
		startThemeWatchers();
		saveShared();
	});
	btnPick.addEventListener('click', e => {
		e.stopPropagation();
		if (cv().isRunning) return;
		isPicking = !isPicking;
		if (isPicking) {
			hideInfoPanel(false);
			setPanelTransparent();
			btnPick.textContent = '取消选取';
			btnPick.classList.add('picking');
			stateSpan.textContent = cv().isMultiMode ? '请依次点击多个目标元素' : '请点击目标元素';
			stateSpan.classList.remove('auto-op-waiting');
			document.addEventListener('mouseover', onPickHover, true);
			document.addEventListener('mouseout', onPickHoverOut, true);
			document.addEventListener('click', onPickClick, true);
			document.addEventListener('touchend', onPickTouch, true);
		} else {
			exitPickMode();
		}
	});

	function onPickHover(e) {
		if (!isPicking) return;
		const el = e.target;
		if (panel.contains(el) || configMenuEl.contains(el)) return;
		el.classList.add('auto-op-highlight');
	}

	function onPickHoverOut(e) {
		e.target.classList.remove('auto-op-highlight');
	}

	function onPickTouch(e) {
		if (!isPicking || isDragging) return;
		const touch = e.changedTouches[0],
			el = document.elementFromPoint(touch.clientX, touch.clientY);
		if (!el || panel.contains(el) || configMenuEl.contains(el)) return;
		if (!pickPassThrough) {
			e.preventDefault();
			e.stopPropagation();
		}
		selectTarget(el);
	}

	function onPickClick(e) {
		if (!isPicking || !e.isTrusted) return;
		const el = e.target;
		if (panel.contains(el) || configMenuEl.contains(el)) return;
		if (!pickPassThrough) {
			e.preventDefault();
			e.stopPropagation();
		}
		selectTarget(el);
	}

	function selectTarget(el) {
		if (stateTimerID) {
			clearTimeout(stateTimerID);
			stateTimerID = null;
		}
		el.classList.remove('auto-op-highlight');
		const c = cv();
		const sels = buildSelectors(el),
			fp = getElementFingerprint(el);
		let desc = el.tagName.toLowerCase();
		if (el.id) desc += '#' + el.id;
		if (el.className && typeof el.className === 'string') {
			const cls = el.className.trim().split(/\s+/).filter(ch => ch && !ch.startsWith('auto-op-')).slice(0, 5).join('.');
			if (cls) desc += '.' + cls;
		}
		const text = getElText(el);
		if (text) desc += ' "' + text + '"';
		const isInput = isInputField(el);
		if (isInput) desc += ' (isInput)';
		let parentSelector = '',
			parentChain = [],
			nearestParent = el.parentElement,
			blueParent = null,
			ancestor = el.parentElement;
		while (ancestor && ancestor !== document.body) {
			const s = buildBaseSelector(ancestor);
			if (s !== ancestor.tagName.toLowerCase()) {
				if (!parentSelector) parentSelector = s;
				if (!blueParent) blueParent = ancestor;
				let pdesc = ancestor.tagName.toLowerCase();
				if (ancestor.id) pdesc += '#' + ancestor.id;
				if (ancestor.className && typeof ancestor.className === 'string') {
					const cls = ancestor.className.trim().split(/\s+/).filter(ch => ch && !ch.startsWith('auto-op-')).slice(0, 5).join('.');
					if (cls) pdesc += '.' + cls;
				}
				parentChain.push({
					selector: s,
					desc: pdesc
				});
			}
			ancestor = ancestor.parentElement;
		}
		const targetObj = {
			element: el,
			strict: sels.strict,
			loose: sels.loose,
			fingerprint: fp,
			desc,
			isInput,
			parentSelector,
			parentChain,
			nearestParent,
			blueParent,
			isAuto: false,
			missCount: 0,
			_isValid: true,
			enabled: true,
		enableHighlight: true,
			matchTag: true,
			matchText: true,
			matchTextMode: 'exact',
			matchDataAttrs: true,
			matchAttrs: true,
			autoDiscover: false,
			matchParent: !!parentSelector,
			matchOnclick: !!fp.onclickParam,
			matchId: !!fp.id,
			matchClass: !!fp.className
		};
		if (c.isMultiMode) {
			c.targets.push(targetObj);
			if (targetObj.enableHighlight !== false) el.classList.add('auto-op-selected-highlight');
			stateSpan.textContent = `已选 ${c.targets.length} 个，继续选取或取消`;
		} else {
			c.targets.forEach(t => {
				if (t.element && t.element.classList) t.element.classList.remove('auto-op-selected-highlight');
				if (t._blueParent && t._blueParent.classList) {
					t._blueParent.classList.remove('auto-op-parent-highlight');
					t._blueParent.classList.remove('auto-op-parent-highlight-Overlap');
				}
				if (t._nearestEl && t._nearestEl.classList) t._nearestEl.classList.remove('auto-op-nearest-parent-highlight');
			});
			c.targets = [targetObj];
			if (targetObj.enableHighlight !== false) el.classList.add('auto-op-selected-highlight');
			exitPickMode();
			if (c.targets.length > 0) stateSpan.textContent = '就绪';
		}
		updateTargetUI();
		updateTargetCount();
		refreshParentHighlights();
		savePerConfig(activeConfig);
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
		restorePanelOpacity();
		const c = cv();
		if (c.isMultiMode) {
			stateSpan.textContent = c.targets.length === 0 ? '未选取目标元素' : `已选 ${c.targets.length} 个`;
		} else {
			stateSpan.textContent = c.targets.length === 0 ? '未选取目标元素' : '就绪';
		}
		if (c.targets.length === 0) {
			if (stateTimerID) {
				clearTimeout(stateTimerID);
				stateTimerID = null;
			}
			stateTimerID = setTimeout(() => {
				if (stateSpan.textContent === '未选取目标元素') stateSpan.textContent = '请选取目标元素';
				stateTimerID = null;
			}, 1500);
		}
	}
	async function clearSelection(manual) {
		const c = cv();
		if (manual && IS_MOBILE && c.targets.length > 0 && !await showConfirm('确定清空 ' + c.targets.length + ' 个目标元素？')) return;
		for (const t of c.targets) {
			if (t.element && t.element.classList) t.element.classList.remove('auto-op-selected-highlight');
			if (t._blueParent && t._blueParent.classList) {
				t._blueParent.classList.remove('auto-op-parent-highlight');
				t._blueParent.classList.remove('auto-op-parent-highlight-Overlap');
			}
			if (t._nearestEl && t._nearestEl.classList) t._nearestEl.classList.remove('auto-op-nearest-parent-highlight');
		}
		c.targets = [];
		c.currentQueueIndex = 0;
		updateTargetUI();
		updateTargetCount();
		stateSpan.textContent = '目标元素已清空';
		if (stateTimerID) {
			clearTimeout(stateTimerID);
			stateTimerID = null;
		}
		stateTimerID = setTimeout(() => {
			if (stateSpan.textContent === '目标元素已清空') stateSpan.textContent = '请选取目标元素';
			stateTimerID = null;
		}, 1000);
		refreshParentHighlights();
		savePerConfig(activeConfig);
	}
	btnClearAll.addEventListener('click', e => {
		e.stopPropagation();
		clearSelection(true);
	});

	function handleToggleRunning(e) {
		e.stopPropagation();
		onPanelClickRestore();
		const c = cv();
		if (c.targets.length === 0) return;
		if (!c.isRunning) {
			hideInfoPanel(false);
			hideSettingsPanel(false);
			startClickingFor(activeConfig);
		} else {
			stopClickingFor(activeConfig);
			stateSpan.textContent = '已停止';
		}
	}
	btnStart.addEventListener('click', handleToggleRunning);
	btnHeaderStart.addEventListener('click', handleToggleRunning);

	function formatCmdTime() {
		const d = new Date();
		return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
	}

	function appendCmdOutput(type, message) {
		cmdOutputLogs.push({ type, message, time: formatCmdTime() });
		if (cmdOutputLogs.length > 500) cmdOutputLogs.shift();
		updateCmdOutputUI();
	}

	function updateCmdOutputUI() {
		if (!cmdOutput) return;
		if (cmdOutputLogs.length === 0) {
			cmdOutput.innerHTML = '<div class="auto-op-cmd-output-empty">等待指令执行...</div>';
			return;
		}
		let html = '';
		for (let i = 0; i < cmdOutputLogs.length; i++) {
			const entry = cmdOutputLogs[i];
			let cls = 'auto-op-cmd-output-log';
			if (entry.type === 'warn') cls = 'auto-op-cmd-output-warn';
			else if (entry.type === 'info') cls = 'auto-op-cmd-output-info';
			else if (entry.type === 'debug') cls = 'auto-op-cmd-output-debug';
			else if (entry.type === 'error') cls = 'auto-op-cmd-output-error';
			else if (entry.type === 'result') cls = 'auto-op-cmd-output-result';
			html += '<div class="auto-op-cmd-output-entry"><span class="auto-op-cmd-output-time">[' + entry.time + ']</span><span class="' + cls + '">[' + entry.type + ']</span> <span class="auto-op-cmd-output-log">' + escapeHtml(entry.message) + '</span></div>';
		}
		cmdOutput.innerHTML = html;
		cmdOutput.scrollTop = cmdOutput.scrollHeight;
	}

	function escapeHtml(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	function runUserCommand(code, el, t, ci, idx) {
		const c = configs[ci];
		const targetList = c.targets;
		const logs = [];
		const _orig = {};
		['log', 'warn', 'error', 'info', 'debug'].forEach(m => {
			_orig[m] = console[m];
			console[m] = function() {
				const args = Array.prototype.slice.call(arguments);
				logs.push({ type: m, msg: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 0) : String(a)).join(' ') });
				_orig[m].apply(console, arguments);
			};
		});

		function flushLogs() {
			logs.forEach(l => appendCmdOutput(l.type, l.msg));
			logs.length = 0;
		}

		function restoreConsole() {
			Object.keys(_orig).forEach(m => { console[m] = _orig[m]; });
		}

		function finalize(success, errorMsg, result) {
			flushLogs();
			restoreConsole();
			if (!success) appendCmdOutput('error', errorMsg);
			else if (result !== undefined) appendCmdOutput('result', '↳ ' + (typeof result === 'object' ? JSON.stringify(result, null, 0) : String(result)));
		}

		let result, success = true,
			errorMsg = '';
		try {
			const fn = new Function('$el', '$target', '$config', '$index', '$targets', code);
			result = fn(el, t, c, idx, targetList);
		} catch (e) {
			success = false;
			errorMsg = e.message || String(e);
			finalize(false, errorMsg, undefined);
			return { success: false, error: errorMsg, logs };
		}

		if (result && typeof result.then === 'function') {
			result.then(val => {
				flushLogs();
				finalize(true, '', val);
			}).catch(e => {
				flushLogs();
				finalize(false, e.message || String(e), undefined);
			});
			return { success: true, pending: true, logs };
		}

		finalize(success, errorMsg, result);
		return { success, result, error: errorMsg, logs };
	}

	cmdTestBtn.addEventListener('click', () => {
		const code = cmdInput.value.trim();
		if (!code) { appendCmdOutput('error', '请输入指令代码'); return; }
		if (cmdHistory.length === 0 || cmdHistory[cmdHistory.length - 1] !== code) {
			cmdHistory.push(code);
			cmdHistoryIndex = cmdHistory.length;
		}
		const c = cv();
		let testEl = null,
			testT = null,
			testIdx = -1;
		for (let i = 0; i < c.targets.length; i++) {
			const t = c.targets[i];
			if (t.enabled !== false && t.element && document.contains(t.element)) {
				testEl = t.element;
				testT = t;
				testIdx = i;
				break;
			}
		}
		if (!testEl && c.targets.length > 0) {
			testT = c.targets[0];
			testIdx = 0;
		}
		appendCmdOutput('log', '> ' + code);
		runUserCommand(code, testEl, testT, activeConfig, testIdx);
	});

	cmdTargetBtn.addEventListener('click', () => {
		const c = cv();
		if (!c.isMultiMode && c.targets.length > 0) { appendCmdOutput('error', '非多选模式下已有目标，请先清空或开启多选模式'); return; }
		const code = cmdInput.value.trim();
		if (!code) { appendCmdOutput('error', '请输入指令代码'); return; }
		const desc = '指令: ' + code.slice(0, 40).replace(/\n/g, ' ') + (code.length > 40 ? '...' : '');
		c.targets.push({
			isCommand: true,
			desc: desc,
			customCommand: code,
			enabled: true,
			customInterval: '',
			element: null,
			_isValid: true
		});
		updateTargetUI();
		updateTargetCount();
		savePerConfig(activeConfig);
		appendCmdOutput('log', '已添加到目标队列: ' + desc);
	});

	cmdClearOutputBtn2.addEventListener('click', () => {
		cmdOutputLogs = [];
		updateCmdOutputUI();
	});

	cmdPresetSelect.addEventListener('change', () => {
		const val = cmdPresetSelect.value;
		if (val) {
			cmdInput.value = val;
			cmdPresetSelect.value = '';
		}
	});

	cmdInput.addEventListener('keydown', e => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			cmdTestBtn.click();
			return;
		}
		if (e.key === 'ArrowUp') {
			if (cmdHistory.length === 0) return;
			if (cmdHistoryIndex === cmdHistory.length) cmdHistoryIndex = cmdHistory.length - 1;
			else if (cmdHistoryIndex > 0) cmdHistoryIndex--;
			cmdInput.value = cmdHistory[cmdHistoryIndex] || '';
			e.preventDefault();
		} else if (e.key === 'ArrowDown') {
			if (cmdHistory.length === 0) return;
			if (cmdHistoryIndex < cmdHistory.length - 1) cmdHistoryIndex++;
			else { cmdHistoryIndex = cmdHistory.length; cmdInput.value = ''; }
			e.preventDefault();
		}
	});

	function startNetworkMonitor() {
		if (isNetworkMonitoring) return;
		isNetworkMonitoring = true;
		_networkReqId = 0;
		_origFetch = window.fetch;
		_origXHROpen = XMLHttpRequest.prototype.open;
		_origXHRSend = XMLHttpRequest.prototype.send;
		window.fetch = function(url, options) {
			const id = ++_networkReqId;
			const startTime = Date.now();
			const method = (options && options.method) || 'GET';
			const reqHeaders = options && options.headers ? Object.assign({}, options.headers) : {};
			const reqBody = options && options.body ? String(options.body).slice(0, 4000) : '';
			const urlStr = typeof url === 'string' ? url : (url.url || String(url));
			addNetworkRequest({ id, method: method.toUpperCase(), url: urlStr, reqHeaders, reqBody, status: 'pending', startTime });
			const promise = _origFetch.apply(this, arguments);
			promise.then(response => {
				const endTime = Date.now();
				const clone = response.clone();
				const req = networkRequests.find(r => r.id === id);
				if (req) {
					req.status = response.status;
					req.statusText = response.statusText;
					req.resHeaders = {};
					response.headers.forEach((v, k) => { req.resHeaders[k] = v; });
					req.duration = endTime - startTime;
					clone.text().then(body => {
						req.resBody = body.slice(0, 4000);
						updateNetworkItemUI(req);
						updateNetworkCount();
					}).catch(() => {
						updateNetworkItemUI(req);
						updateNetworkCount();
					});
				}
				return response;
			}).catch(err => {
				const endTime = Date.now();
				const req = networkRequests.find(r => r.id === id);
				if (req) {
					req.status = 0;
					req.error = err.message;
					req.duration = endTime - startTime;
					updateNetworkItemUI(req);
					updateNetworkCount();
				}
				throw err;
			});
			return promise;
		};
		XMLHttpRequest.prototype.open = function(method, url) {
			this._autoOpReq = { id: ++_networkReqId, method: method.toUpperCase(), url: String(url), status: 'pending', startTime: Date.now(), reqHeaders: {} };
			return _origXHROpen.apply(this, arguments);
		};
		XMLHttpRequest.prototype.send = function(body) {
			const reqData = this._autoOpReq;
			if (reqData) {
				reqData.reqBody = body ? String(body).slice(0, 4000) : '';
				reqData._xhr = this;
				addNetworkRequest(reqData);
				this.addEventListener('load', function() {
					const endTime = Date.now();
					reqData.status = this.status;
					reqData.statusText = this.statusText;
					reqData.resHeaders = {};
					const headersStr = this.getAllResponseHeaders();
					headersStr.split('\r\n').forEach(line => {
						const idx = line.indexOf(': ');
						if (idx > 0) reqData.resHeaders[line.slice(0, idx)] = line.slice(idx + 2);
					});
					reqData.resBody = String(this.responseText).slice(0, 4000);
					reqData.duration = endTime - reqData.startTime;
					updateNetworkItemUI(reqData);
					updateNetworkCount();
				});
				this.addEventListener('error', function() {
					reqData.status = 0;
					reqData.error = 'Network Error';
					reqData.duration = Date.now() - reqData.startTime;
					updateNetworkItemUI(reqData);
					updateNetworkCount();
				});
				const _setRequestHeader = this.setRequestHeader;
				const self = this;
				this.setRequestHeader = function(name, value) {
					reqData.reqHeaders[name] = value;
					return _setRequestHeader.apply(self, arguments);
				};
			}
			return _origXHRSend.apply(this, arguments);
		};
		networkToggle.checked = true;
		btnNetworkMonitor.classList.add('active');
	}

	function stopNetworkMonitor() {
		if (!isNetworkMonitoring) return;
		isNetworkMonitoring = false;
		if (_origFetch) window.fetch = _origFetch;
		if (_origXHROpen) XMLHttpRequest.prototype.open = _origXHROpen;
		if (_origXHRSend) XMLHttpRequest.prototype.send = _origXHRSend;
		_origFetch = null;
		_origXHROpen = null;
		_origXHRSend = null;
		networkToggle.checked = false;
		btnNetworkMonitor.classList.remove('active');
	}

	function toggleNetworkMonitor() {
		if (isNetworkMonitoring) stopNetworkMonitor();
		else startNetworkMonitor();
	}

	function addNetworkRequest(req) {
		networkRequests.push(req);
		if (networkRequests.length > 500) networkRequests.shift();
		appendRequestItemUI(req);
		updateNetworkCount();
		if (networkRequests.length === 1) renderNetworkList();
	}

	function updateNetworkCount() {
		if (networkCountSpan) networkCountSpan.textContent = networkRequests.length;
	}

	function updateNetworkItemUI(req) {
		const item = document.getElementById('auto-op-net-item-' + req.id);
		if (!item) return;
		const statusEl = item.querySelector('.auto-op-network-status');
		if (statusEl) {
			if (req.status === 'pending') {
				statusEl.textContent = '...';
				statusEl.className = 'auto-op-network-status pending';
			} else if (req.status >= 200 && req.status < 400) {
				statusEl.textContent = req.status;
				statusEl.className = 'auto-op-network-status ok';
			} else {
				statusEl.textContent = req.status || 'ERR';
				statusEl.className = 'auto-op-network-status err';
			}
		}
		const detailDiv = item.querySelector('.auto-op-network-item-detail');
		if (detailDiv && !detailDiv.dataset.built && req.status !== 'pending') {
			detailDiv.dataset.built = '1';
			detailDiv.innerHTML = buildRequestDetail(req);
		}
	}

	function buildRequestDetail(req) {
		let html = '';
		html += '<div class="auto-op-network-detail-row"><span class="auto-op-network-detail-label">' + req.method + '</span> <span class="auto-op-network-detail-url">' + escapeHtml(req.url) + '</span></div>';
		if (req.duration !== undefined) html += '<div class="auto-op-network-detail-row"><span class="auto-op-network-detail-label">耗时:</span>' + req.duration + 'ms</div>';
		if (req.error) html += '<div class="auto-op-network-detail-row"><span class="auto-op-network-detail-label">错误:</span><span style="color:var(--panel-missing-border)">' + escapeHtml(req.error) + '</span></div>';
		if (req.reqHeaders && Object.keys(req.reqHeaders).length > 0) html += '<div class="auto-op-network-detail-row"><span class="auto-op-network-detail-label">请求头:</span><div class="auto-op-network-detail-value">' + escapeHtml(JSON.stringify(req.reqHeaders, null, 2)) + '</div></div>';
		if (req.reqBody) html += '<div class="auto-op-network-detail-row"><span class="auto-op-network-detail-label">请求体:</span><div class="auto-op-network-detail-value">' + escapeHtml(req.reqBody) + '</div></div>';
		if (req.resHeaders && Object.keys(req.resHeaders).length > 0) html += '<div class="auto-op-network-detail-row"><span class="auto-op-network-detail-label">响应头:</span><div class="auto-op-network-detail-value">' + escapeHtml(JSON.stringify(req.resHeaders, null, 2)) + '</div></div>';
		if (req.resBody) html += '<div class="auto-op-network-detail-row"><span class="auto-op-network-detail-label">响应体:</span><div class="auto-op-network-detail-value">' + escapeHtml(req.resBody) + '</div></div>';
		html += '<div class="auto-op-network-detail-row"><button class="auto-op-network-detail-copy" data-copy-id="' + req.id + '">复制 JS 指令</button></div>';
		return html;
	}

	function appendRequestItemUI(req) {
		if (!networkRequests.length || networkRequests.length === 1) renderNetworkList();
		else {
			const empty = networkContentEl.querySelector('.auto-op-network-empty');
			if (empty) empty.remove();
			const temp = document.createElement('div');
			temp.innerHTML = buildRequestItemHTML(req);
			const el = temp.firstChild;
			networkContentEl.insertBefore(el, networkContentEl.firstChild);
			refreshNetworkHeight();
		}
	}

	function buildRequestItemHTML(req) {
		const methodLower = req.method.toLowerCase();
		let methodClass = 'xhr';
		if (['get', 'post', 'put', 'delete', 'patch'].includes(methodLower)) methodClass = methodLower;
		let statusClass = 'pending',
			statusText = '...';
		if (req.status === 'pending') { statusClass = 'pending';
			statusText = '...'; } else if (req.status >= 200 && req.status < 400) { statusClass = 'ok';
			statusText = String(req.status); } else { statusClass = 'err';
			statusText = req.status ? String(req.status) : 'ERR'; }
		return '<div class="auto-op-network-item" id="auto-op-net-item-' + req.id + '"><div class="auto-op-network-item-top"><span class="auto-op-network-method ' + methodClass + '">' + req.method + '</span><span class="auto-op-network-url" title="' + escapeHtml(req.url) + '">' + escapeHtml(req.url) + '</span><span class="auto-op-network-status ' + statusClass + '">' + statusText + '</span><button class="auto-op-network-del-btn" data-del-id="' + req.id + '" title="删除"><svg viewBox="0 0 1208.4 1208.4" fill="none" aria-hidden="true" style="width:10px;height:10px;display:block"><path d="M690.7 311.7 L1035.7 656.7 Q1072.7 692.7 1072.7 743.7 Q1072.7 794.7 1035.7 830.7 L800.7 1067.7 Q776.7 1091.7 744.7 1099.7 Q712.7 1107.7 680.7 1099.7 Q648.7 1091.7 625.7 1067.7 L174.7 616.7 Q151.7 593.7 143.7 561.7 Q135.7 529.7 143.7 498.2 Q151.7 466.7 174.7 443.7 L306.7 311.7 Q323.7 294.7 346.2 285.2 Q368.7 275.7 393.7 275.7 H603.7 Q628.7 275.7 651.2 285.2 Q673.7 294.7 690.7 311.7 Z M1058.7 140.7 V173.7 Q1058.7 189.7 1046.2 201.7 Q1033.7 213.7 1017.7 213.7 H177.7 Q160.7 213.7 148.7 201.7 Q136.7 189.7 136.7 173.7 V140.7 Q136.7 123.7 148.7 112.2 Q160.7 100.7 177.7 100.7 H1017.7 Q1034.7 100.7 1046.7 112.7 Q1058.7 124.7 1058.7 140.7 Z M376.7 401.7 L272.7 505.7 Q262.7 515.7 262.7 530.2 Q262.7 544.7 272.7 554.7 L366.7 647.7 Q375.7 656.7 383.7 647.7 L617.7 413.7 Q623.7 407.7 617.7 401.7 L611.7 396.7 Q600.7 388.7 588.7 388.7 H408.7 Q389.7 388.7 376.7 401.7 Z M691.7 498.7 L462.7 727.7 Q454.7 735.7 462.7 744.7 L688.7 970.7 Q698.7 980.7 712.7 980.7 Q726.7 980.7 736.7 970.7 L939.7 767.7 Q949.7 757.7 949.7 743.7 Q949.7 729.7 939.7 719.7 L715.7 497.7 Q709.7 491.7 703.7 492.2 Q697.7 492.7 691.7 498.7 Z" transform="matrix(1 0 0 -1 0 1208.4)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg></button></div><div class="auto-op-network-item-detail"></div></div>';
	}

	function renderNetworkList() {
		if (!networkContentEl) return;
		if (networkRequests.length === 0) {
			networkContentEl.innerHTML = '<span class="auto-op-network-empty">未监测到请求</span>';
			refreshNetworkHeight();
			return;
		}
		let html = '';
		for (let i = networkRequests.length - 1; i >= 0; i--) {
			html += buildRequestItemHTML(networkRequests[i]);
		}
		networkContentEl.innerHTML = html;
		for (let i = 0; i < networkRequests.length; i++) {
			const req = networkRequests[i];
			if (req.status !== 'pending') {
				const detailDiv = document.getElementById('auto-op-net-item-' + req.id);
				if (detailDiv) {
					const d = detailDiv.querySelector('.auto-op-network-item-detail');
					if (d && !d.dataset.built) {
						d.dataset.built = '1';
						d.innerHTML = buildRequestDetail(req);
					}
				}
			}
		}
		refreshNetworkHeight();
	}

	function copyToClipboard(text) {
		try {
			const ta = document.createElement('textarea');
			ta.value = text;
			ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
			document.body.appendChild(ta);
			ta.focus();
			ta.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(ta);
			return ok;
		} catch (e) {
			return false;
		}
	}

	function buildFetchCode(req) {
		const headersObj = req.reqHeaders && Object.keys(req.reqHeaders).length > 0 ? req.reqHeaders : null;
		const bodyStr = req.reqBody || null;
		if (bodyStr) {
			return 'fetch(' + JSON.stringify(req.url) + ', {\n  method: ' + JSON.stringify(req.method) + ',\n  headers: ' + JSON.stringify(headersObj) + ',\n  body: ' + JSON.stringify(bodyStr) + '\n}).then(r => r.text()).then(console.log)';
		} else if (headersObj) {
			return 'fetch(' + JSON.stringify(req.url) + ', {\n  method: ' + JSON.stringify(req.method) + ',\n  headers: ' + JSON.stringify(headersObj) + '\n}).then(r => r.text()).then(console.log)';
		} else if (req.method !== 'GET') {
			return 'fetch(' + JSON.stringify(req.url) + ', { method: ' + JSON.stringify(req.method) + ' }).then(r => r.text()).then(console.log)';
		} else {
			return 'fetch(' + JSON.stringify(req.url) + ').then(r => r.text()).then(console.log)';
		}
	}

	function copyRequestAsJS(req) {
		const code = buildFetchCode(req);
		const ok = copyToClipboard(code);
		if (ok) appendCmdOutput('log', '已复制: ' + code.slice(0, 100) + (code.length > 100 ? '...' : ''));
		else appendCmdOutput('error', '复制失败，请手动复制');
	}

	function copyAllRequestsAsJS() {
		if (networkRequests.length === 0) { appendCmdOutput('error', '无请求可复制'); return; }
		const codes = [];
		for (let i = 0; i < networkRequests.length; i++) {
			codes.push(buildFetchCode(networkRequests[i]));
		}
		const allCode = codes.join(';\n');
		const ok = copyToClipboard(allCode);
		if (ok) appendCmdOutput('log', '已复制全部 ' + networkRequests.length + ' 条请求');
		else appendCmdOutput('error', '复制失败，请手动复制');
	}

	let networkAnimTimer = null;

	function refreshNetworkHeight() {
		if (networkOverlayEl.classList.contains('open')) fitBodyToOverlay(networkOverlayEl);
	}

	function showNetworkOverlay() {
		closeConfigMenu();
		if (infoOverlayEl.classList.contains('open')) hideInfoPanel(false);
		if (settingsOverlayEl.classList.contains('open')) hideSettingsPanel(false);
		if (networkAnimTimer) { clearTimeout(networkAnimTimer);
			networkAnimTimer = null; }
		networkOverlayEl.removeEventListener('transitionend', onNetworkCloseTransition);
		networkOverlayEl.classList.remove('open');
		networkOverlayEl.style.display = 'flex';
		renderNetworkList();
		updateNetworkCount();
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				fitBodyToOverlay(networkOverlayEl);
				networkOverlayEl.classList.add('open');
			});
		});
	}

	function hideNetworkOverlay(animate) {
		if (networkAnimTimer) { clearTimeout(networkAnimTimer);
			networkAnimTimer = null; }
		networkOverlayEl.removeEventListener('transitionend', onNetworkCloseTransition);
		if (animate) {
			networkOverlayEl.style.display = 'flex';
			networkOverlayEl.addEventListener('transitionend', onNetworkCloseTransition);
			restoreBodyHeight();
			updatePageHeight();
		}
		networkOverlayEl.classList.remove('open');
		if (!animate) {
			networkOverlayEl.style.display = 'none';
			restoreBodyHeight();
			updatePageHeight();
		}
	}

	function onNetworkCloseTransition(e) {
		if (e.propertyName !== 'transform') return;
		networkOverlayEl.removeEventListener('transitionend', onNetworkCloseTransition);
		networkOverlayEl.style.display = 'none';
	}

	btnNetworkMonitor.addEventListener('click', e => {
		e.stopPropagation();
		if (networkOverlayEl.classList.contains('open')) hideNetworkOverlay(true);
		else showNetworkOverlay();
	});
	networkBackBtn.addEventListener('click', () => hideNetworkOverlay(true));
	networkToggle.addEventListener('change', toggleNetworkMonitor);
	btnClearNetwork.addEventListener('click', () => {
		networkRequests = [];
		renderNetworkList();
		updateNetworkCount();
	});
	btnCopyAllNetwork.addEventListener('click', copyAllRequestsAsJS);
	networkContentEl.addEventListener('click', e => {
		const delBtn = e.target.closest('.auto-op-network-del-btn');
		if (delBtn) {
			e.stopPropagation();
			const delId = parseInt(delBtn.dataset.delId);
			const idx = networkRequests.findIndex(r => r.id === delId);
			if (idx !== -1) {
				networkRequests.splice(idx, 1);
				renderNetworkList();
				updateNetworkCount();
			}
			return;
		}
		const itemTop = e.target.closest('.auto-op-network-item-top');
		if (itemTop) {
			const item = itemTop.closest('.auto-op-network-item');
			if (item) {
				item.classList.toggle('expanded');
				const reqId = parseInt(item.id.replace('auto-op-net-item-', ''));
				const req = networkRequests.find(r => r.id === reqId);
				if (req && req.status !== 'pending') {
					const detailDiv = item.querySelector('.auto-op-network-item-detail');
					if (detailDiv && !detailDiv.dataset.built) {
						detailDiv.dataset.built = '1';
						detailDiv.innerHTML = buildRequestDetail(req);
					}
				}
				refreshNetworkHeight();
			}
			return;
		}
		const copyBtn = e.target.closest('.auto-op-network-detail-copy');
		if (copyBtn) {
			const copyId = parseInt(copyBtn.dataset.copyId);
			const req = networkRequests.find(r => r.id === copyId);
			if (req) copyRequestAsJS(req);
			return;
		}
	});

	function startClickingFor(ci, savedTimestamp) {
		const c = configs[ci];
		if (stateTimerID && ci === activeConfig) {
			clearTimeout(stateTimerID);
			stateTimerID = null;
		}
		if (isPicking && ci === activeConfig) exitPickMode();
		c.isWaiting = false;
		if (c.waitTimerID) {
			clearTimeout(c.waitTimerID);
			c.waitTimerID = null;
		}
		for (let i = 0; i < c.targets.length; i++) {
			const t = c.targets[i];
			if (!t.element || !document.contains(t.element)) {
				const found = tryFindTarget(t);
				if (found && found.length > 0) {
					if (t.element && t.element.classList) t.element.classList.remove('auto-op-selected-highlight');
					t.element = found[0];
					const parentInfo = resolveParentInfo(found[0]);
					t.nearestParent = parentInfo.nearestParent;
					t.blueParent = parentInfo.blueParent;
					if (ci === activeConfig && t.enableHighlight !== false && t.enabled !== false) found[0].classList.add('auto-op-selected-highlight');
				}
			} else {
				if (!t.blueParent) {
					const parentInfo = resolveParentInfo(t.element);
					t.nearestParent = parentInfo.nearestParent;
					t.blueParent = parentInfo.blueParent;
				}
			}
		}
		discoverNewTargetsFor(ci);
		if (ci === activeConfig) {
			c.clickInterval = parseInt(clickIntervalInput.value) || 1000;
			c.maxClicks = maxClicksInput.value.trim() === '' ? Infinity : (parseInt(maxClicksInput.value) || Infinity);
			c.missingAction = missingActionSelect.value;
		}
		c.isRunning = true;
		c.clickedCount = 0;
		c.currentQueueIndex = 0;
		if (ci === activeConfig) {
			countSpan.textContent = '0';
			btnStart.textContent = '停止';
			btnStart.className = 'auto-op-btn auto-op-btn-stop';
			btnHeaderStart.innerHTML = '<svg viewBox="0 0 1172.4 1172.4" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M927.7 149.7 V1022.7 Q926.7 1051.7 916.7 1063.2 Q906.7 1074.7 880.7 1074.7 H852.7 Q826.7 1074.7 816.2 1062.7 Q805.7 1050.7 805.7 1022.7 V149.7 Q805.7 121.7 816.2 109.7 Q826.7 97.7 851.7 97.7 H879.7 Q907.7 97.7 917.7 109.7 Q927.7 121.7 927.7 149.7 Z M366.7 149.7 V1022.7 Q365.7 1052.7 355.7 1063.7 Q345.7 1074.7 319.7 1074.7 H291.7 Q264.7 1074.7 254.7 1062.7 Q244.7 1050.7 244.7 1022.7 V149.7 Q244.7 121.7 254.2 109.7 Q263.7 97.7 291.7 97.7 H319.7 Q347.7 97.7 357.2 109.7 Q366.7 121.7 366.7 149.7 Z" transform="matrix(1 0 0 -1 0 1172.4)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>';
			btnHeaderStart.classList.add('is-stop');
			btnPick.disabled = true;
			multiModeCheckbox.disabled = true;
			strategySelect.disabled = true;
			maxClicksInput.disabled = true;
			clickIntervalInput.disabled = true;
			missingActionSelect.disabled = true;
			maxDurationInput.disabled = true;
			autoStartIntervalInput.disabled = true;
			statusDiv.classList.add('running');
			stateSpan.textContent = '运行中';
			stateSpan.classList.remove('auto-op-waiting');
		}
		startElapsedTimer(savedTimestamp || 0);
		if (ci === activeConfig) {
			const dVal = parseFloat(maxDurationInput.value);
			c.maxDurationMin = (!isNaN(dVal) && dVal > 0) ? dVal : 0;
		}
		if (c.maxDurationMin > 0) {
			const maxDurationMs = c.maxDurationMin * 60 * 1000;
			if (c.maxDurationTimerID) clearTimeout(c.maxDurationTimerID);
			const alreadyElapsed = savedTimestamp ? (Date.now() - savedTimestamp) : 0;
			const remaining = Math.max(0, maxDurationMs - alreadyElapsed);
			if (remaining <= 0) {
				stopClickingFor(ci);
				if (ci === activeConfig) stateSpan.textContent = '最长时间已到';
				return;
			}
			c.maxDurationTimerID = setTimeout(() => {
				if (c.isRunning) {
					stopClickingFor(ci);
					if (ci === activeConfig) stateSpan.textContent = '最长时间已到';
				}
			}, remaining);
		}
		if (c.autoStartCountdownTimerID) {
			clearInterval(c.autoStartCountdownTimerID);
			c.autoStartCountdownTimerID = null;
		}
		doClickFor(ci);
		if (!c.isMultiMode || c.clickStrategy !== 'sequential') {
			c.timerID = setInterval(() => doClickFor(ci), c.clickInterval);
		}
		requestWakeLock();
		suppressFocus();
		savePerConfig(ci);
		updateConfigBtnLabel();
	}

	function stopClickingFor(ci) {
		const c = configs[ci];
		if (stateTimerID && ci === activeConfig) {
			clearTimeout(stateTimerID);
			stateTimerID = null;
		}
		c.isRunning = false;
		c.isWaiting = false;
		if (!configs.some(cc => cc.isRunning)) restoreFocus();
		if (!isAutoRefresh && !configs.some(cc => cc.isRunning)) releaseWakeLock();
		if (c.waitTimerID) {
			clearTimeout(c.waitTimerID);
			c.waitTimerID = null;
		}
		if (c.timerID) {
			clearTimeout(c.timerID);
			c.timerID = null;
		}
		if (ci === activeConfig) stopElapsedTimer();
		if (c.maxDurationTimerID) {
			clearTimeout(c.maxDurationTimerID);
			c.maxDurationTimerID = null;
		}
		if (c.autoStartEnabled && c.autoStartIntervalMin > 0) {
			c.autoStartNextTime = Date.now() + c.autoStartIntervalMin * 60 * 1000;
			startAutoStartCountdownTimerFor(ci);
		}
		if (ci === activeConfig) {
			btnStart.textContent = '开始';
			btnStart.className = 'auto-op-btn auto-op-btn-start';
			btnHeaderStart.innerHTML = '<svg viewBox="0 0 1202.4 1202.4" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M443.7 167.2 L902.7 433.2 Q970.7 471.2 999.2 492.7 Q1027.7 514.2 1040.7 543.2 Q1051.7 571.2 1051.7 602.2 Q1051.7 633.2 1040.7 661.2 Q1027.7 690.2 999.2 711.2 Q970.7 732.2 902.7 770.2 L443.7 1036.2 Q380.7 1073.2 346.2 1087.7 Q311.7 1102.2 279.7 1099.2 Q249.7 1096.2 223.2 1081.2 Q196.7 1066.2 178.7 1041.2 Q159.7 1016.2 155.2 980.7 Q150.7 945.2 150.7 868.2 V337.2 Q150.7 258.2 155.2 223.2 Q159.7 188.2 177.7 161.2 Q196.7 137.2 223.2 121.7 Q249.7 106.2 279.7 104.2 Q311.7 100.2 345.7 114.7 Q379.7 129.2 443.7 167.2 Z M272.7 231.2 Q269.7 236.2 268.7 262.7 Q267.7 289.2 267.7 337.2 V868.2 Q267.7 916.2 268.7 941.7 Q269.7 967.2 272.7 972.2 Q274.7 977.2 280.2 980.2 Q285.7 983.2 291.7 983.2 Q296.7 983.2 320.7 970.7 Q344.7 958.2 384.7 936.2 L845.7 670.2 Q884.7 647.2 906.7 633.2 Q928.7 619.2 932.7 613.2 Q938.7 602.2 933.7 591.2 Q929.7 584.2 912.2 573.2 Q894.7 562.2 845.7 533.2 L384.7 267.2 Q343.7 243.2 321.2 231.7 Q298.7 220.2 292.7 220.2 Q278.7 220.2 272.7 231.2 Z" transform="matrix(1 0 0 -1 0 1202.4)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>';
			btnHeaderStart.classList.remove('is-stop');
			btnPick.disabled = false;
			multiModeCheckbox.disabled = false;
			strategySelect.disabled = false;
			maxClicksInput.disabled = false;
			clickIntervalInput.disabled = false;
			missingActionSelect.disabled = false;
			maxDurationInput.disabled = false;
			autoStartIntervalInput.disabled = false;
			statusDiv.classList.remove('running');
			stateSpan.classList.remove('auto-op-waiting');
			if (c.targets.length > 0) stateSpan.textContent = '就绪';
			else stateSpan.textContent = '请选取目标元素';
			if (!c.autoStartEnabled || c.autoStartIntervalMin <= 0) autoStartCountdownLabel.textContent = '';
		}
		savePerConfig(ci);
		updateConfigBtnLabel();
	}

	function startWaitTimer(ci, idx) {
		const c = configs[ci];
		if (c.waitTimerID) clearTimeout(c.waitTimerID);

		function update() {
			if (!c.isWaiting || !c.isRunning) {
				if (c.waitTimerID) {
					clearTimeout(c.waitTimerID);
					c.waitTimerID = null;
				}
				return;
			}
			const maxWait = c.clickInterval * 2,
				elapsed = Date.now() - c.waitStartTime,
				remaining = maxWait - elapsed;
			if (remaining <= 0) {
				c.isWaiting = false;
				c.currentQueueIndex = (idx + 1) % c.targets.length;
				if (ci === activeConfig) {
					stateSpan.textContent = `队列[${idx + 1}/${c.targets.length}] 超时跳过`;
					stateSpan.classList.remove('auto-op-waiting');
				}
				return;
			}
			if (ci === activeConfig) {
				stateSpan.textContent = `${remaining}ms 队列[${idx + 1}/${c.targets.length}] 等待元素中`;
				stateSpan.classList.add('auto-op-waiting');
			}
			c.waitTimerID = setTimeout(update, 1);
		}
		update();
	}

	function doClickFor(ci) {
		isProgrammaticClick = true;
		try {
			const c = configs[ci];
			if (!c.isRunning || c.targets.length === 0) {
				stopClickingFor(ci);
				return;
			}
			beginQueryCycle();
			discoverNewTargetsFor(ci);
			if (!c.doClickLastUIUpdate) c.doClickLastUIUpdate = 0;
			const now = Date.now();
			c.uiThrottled = (now - c.doClickLastUIUpdate) < 100;
			if (!c.uiThrottled) c.doClickLastUIUpdate = now;
			const missingAction = c.missingAction || 'wait';
			const status = c.targets.map((t, i) => {
				if (t.enabled === false) {
					if (ci === activeConfig) updateTargetItemStyle(i, null);
					return 'disabled';
				}
				let el = t.element;
				let isValid = el && document.contains(el) && matchesFingerprint(el, t);
				if (!isValid) {
					const found = tryFindTarget(t);
					if (found && found.length > 0) {
						if (t.element && document.contains(t.element)) t.element.classList.remove('auto-op-selected-highlight');
						t.element = found[0];
						const parentInfo = resolveParentInfo(found[0]);
						t.nearestParent = parentInfo.nearestParent;
						t.blueParent = parentInfo.blueParent;
						if (ci === activeConfig && t.enableHighlight !== false && t.enabled !== false) found[0].classList.add('auto-op-selected-highlight');
						isValid = true;
					}
				}
				if (ci === activeConfig) updateTargetItemStyle(i, isValid ? false : true);
				return isValid;
			});
			const totalCount = c.targets.length;
			for (let i = 0; i < totalCount; i++) c.targets[i]._isValid = status[i];
			if (ci === activeConfig && !c.uiThrottled) updateTargetCount(status);
			if (c.isMultiMode && c.clickStrategy === 'sequential') {
				let idx = c.currentQueueIndex;
				if (idx >= totalCount) {
					idx = 0;
					c.currentQueueIndex = 0;
				}
				if (status[idx] === 'disabled') {
					if (c.isWaiting) {
						c.isWaiting = false;
						if (c.waitTimerID) {
							clearTimeout(c.waitTimerID);
							c.waitTimerID = null;
						}
					}
					updateRunningDisplay(ci, c.clickedCount, `队列[${idx + 1}/${totalCount}] 已禁用跳过`);
					c.currentQueueIndex = (idx + 1) % totalCount;
				} else if (status[idx]) {
					if (c.isWaiting) {
						c.isWaiting = false;
						if (c.waitTimerID) {
							clearTimeout(c.waitTimerID);
							c.waitTimerID = null;
						}
					}
					const t = c.targets[idx],
						el = t.element;
					if (t.scrollIntoView) {
						el.scrollIntoView({
							behavior: 'smooth',
							block: 'center'
						});
					}
					if (t.isCommand) {
							var cmdRes = runUserCommand(t.customCommand, el, t, ci, idx); if (cmdRes && !cmdRes.success) t.commandError = true; else t.commandError = false;
						} else if (t.isInput) {
							const fill = t.customFill || '';
							if (isInputField(el) && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
							el.value = fill;
							el.dispatchEvent(new Event('input', {
								bubbles: true
							}));
							el.dispatchEvent(new Event('change', {
								bubbles: true
							}));
						} else if (el.isContentEditable) el.innerHTML = fill;
					} else {
						el.click();
					}
					c.clickedCount++;
					updateRunningDisplay(ci, c.clickedCount, `队列[${idx + 1}/${totalCount}]`);
					c.currentQueueIndex = (idx + 1) % totalCount;
					if (c.clickedCount >= c.maxClicks) {
						stopClickingFor(ci);
						if (ci === activeConfig) stateSpan.textContent = '已完成';
					}
					if (c.isRunning) {
						let nextDelay = c.clickInterval;
						if (t.customInterval != null && t.customInterval !== '') {
							nextDelay = Number(t.customInterval);
						}
						if (c.timerID) {
							clearTimeout(c.timerID);
						}
						c.timerID = setTimeout(() => doClickFor(ci), nextDelay);
					}
					cleanupAutoTargetsFor(ci, status);
					return;
				} else {
					if (missingAction === 'stop') {
						stopClickingFor(ci);
						updateRunningDisplay(ci, c.clickedCount, `队列[${idx + 1}] 元素已消失`);
					} else {
						if (!c.isWaiting) {
							c.isWaiting = true;
							c.waitStartTime = Date.now();
							startWaitTimer(ci, idx);
						}
					}
				}
				if (c.isRunning) {
					let nextDelay = c.clickInterval;
					if (c.timerID) {
						clearTimeout(c.timerID);
					}
					c.timerID = setTimeout(() => doClickFor(ci), nextDelay);
				}
				cleanupAutoTargetsFor(ci, status);
				return;
			}
			let shouldStop = false,
				anyClicked = 0;
			for (let i = 0; i < totalCount; i++) {
				const t = c.targets[i];
				if (status[i] === 'disabled') {
					continue;
				}
				if (status[i]) {
					if (c.clickedCount >= c.maxClicks) {
						stopClickingFor(ci);
						if (ci === activeConfig && !isPowerSave) stateSpan.textContent = '已完成';
						break;
					}
					anyClicked++;
					c.clickedCount++;
					const el = t.element;
					if (t.scrollIntoView) {
						el.scrollIntoView({
							behavior: 'smooth',
							block: 'center'
						});
					}
					if (t.isCommand) {
							var cmdRes2 = runUserCommand(t.customCommand, el, t, ci, i); if (cmdRes2 && !cmdRes2.success) t.commandError = true; else t.commandError = false;
						} else if (t.isInput) {
							const fill = t.customFill || '';
							if (isInputField(el) && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
							el.value = fill;
							el.dispatchEvent(new Event('input', {
								bubbles: true
							}));
							el.dispatchEvent(new Event('change', {
								bubbles: true
							}));
						} else if (el.isContentEditable) el.innerHTML = fill;
					} else {
						el.click();
					}
				} else {
					if (missingAction === 'stop') shouldStop = true;
				}
			}
			if (shouldStop) {
				stopClickingFor(ci);
				updateRunningDisplay(ci, c.clickedCount, '元素已消失');
				return;
			}
			if (anyClicked) {
				updateRunningDisplay(ci, c.clickedCount, c.isMultiMode && c.clickStrategy === 'simultaneous' ? '同时操作运行中' : '运行中');
				if (c.clickedCount >= c.maxClicks) {
					stopClickingFor(ci);
					if (ci === activeConfig && !isPowerSave) stateSpan.textContent = '已完成';
				}
			}
			cleanupAutoTargetsFor(ci, status);
		} catch (e) {
			console.error('[AUTO_OP] doClickFor 异常:', e);
		}
		isProgrammaticClick = false;
	}

	function cleanupAutoTargetsFor(ci, status) {
		const c = configs[ci];
		let changed = false;
		for (let i = c.targets.length - 1; i >= 0; i--) {
			if (!c.targets[i].isAuto) continue;
			if (status[i] !== undefined && status[i]) c.targets[i].missCount = 0;
			else if (status[i] === false) {
				c.targets[i].missCount = (c.targets[i].missCount || 0) + 1;
				if (c.targets[i].missCount >= 5) {
					c.targets[i].element && c.targets[i].element.classList && c.targets[i].element.classList.remove('auto-op-selected-highlight');
					c.discoveredElements.delete(c.targets[i].element);
					c.targets.splice(i, 1);
					changed = true;
				}
			}
		}
		if (c.targets.length > 0 && c.currentQueueIndex >= c.targets.length) c.currentQueueIndex = 0;
		if (ci === activeConfig && (!c.uiThrottled || changed)) {
			refreshParentHighlights();
			updateTargetUI();
			updateTargetCount();
			if (changed) c.doClickLastUIUpdate = Date.now();
		}
	}
	panel.addEventListener('click', (e) => {
		if (e.target === configBtnEl || configBtnEl.contains(e.target)) return;
		closeConfigMenu();
	}, true);
	panel.addEventListener('mousedown', (e) => {
		if (isPanelTransparent) onPanelClickRestore();
	});
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible' && (configs.some(c => c.isRunning) || isAutoRefresh)) requestWakeLock();
	});
	detectBrowserTheme();
	loadData();
	const initBody = panel.querySelector('.auto-op-body');
	panel.style.transition = 'none';
	if (initBody) initBody.style.transition = 'none';
	panel.classList.add('collapsed');
	toggleBtn.innerHTML = '<svg viewBox="0 0 1155.6 1155.6" fill="none" aria-hidden="true" style="width:14px;height:14px;display:block"><path d="M214.3 692.3 V936.3 Q214.3 938.3 215.8 939.8 Q217.3 941.3 219.3 941.3 H463.3 Q479.3 941.3 491.8 953.3 Q504.3 965.3 504.3 981.3 V1018.3 Q504.3 1035.3 492.3 1047.3 Q480.3 1059.3 463.3 1059.3 H155.3 Q129.3 1059.3 112.8 1043.3 Q96.3 1027.3 96.3 1001.3 V692.3 Q96.3 676.3 108.8 663.8 Q121.3 651.3 137.3 651.3 H174.3 Q190.3 651.3 202.3 663.3 Q214.3 675.3 214.3 692.3 Z M686.3 577.3 Q686.3 622.3 654.3 654.3 Q622.3 686.3 577.3 686.3 Q532.3 686.3 500.3 654.3 Q468.3 622.3 468.3 577.3 Q468.3 532.3 500.3 500.3 Q532.3 468.3 577.3 468.3 Q621.3 468.3 653.8 500.8 Q686.3 533.3 686.3 577.3 Z M1059.3 154.3 V463.3 Q1059.3 480.3 1047.3 492.3 Q1035.3 504.3 1018.3 504.3 H981.3 Q965.3 504.3 952.8 492.3 Q940.3 480.3 940.3 463.3 V219.3 Q940.3 214.3 936.3 214.3 H691.3 Q675.3 214.3 663.3 202.3 Q651.3 190.3 651.3 174.3 V136.3 Q651.3 120.3 663.3 108.3 Q675.3 96.3 691.3 96.3 H1001.3 Q1027.3 97.3 1043.3 112.8 Q1059.3 128.3 1059.3 154.3 Z" transform="matrix(1 0 0 -1 0 1155.6)" fill="currentColor" fill-rule="nonzero" clip-rule="nonzero"></path></svg>';
	measureCollapsedWidth();
	panel.style.width = collapsedWidth + 'px';
	void panel.offsetWidth;
	panel.style.transition = '';
	if (initBody) initBody.style.transition = '';
	schedulePanelTransparent(1000);
	goToPage(currentPage, false);
	pageContainer.querySelectorAll('.auto-op-page').forEach(p => {
		new ResizeObserver(() => updatePageHeight()).observe(p);
	});
	new ResizeObserver(() => {
		updatePageHeight();
	}).observe(cmdInput);
	new MutationObserver(() => {
		updatePageHeight();
	}).observe(cmdInput, { attributes: true, attributeFilter: ['style'] });
	(function restoreAutoRefreshState() {
		const rs = loadRefreshState();
		if (rs && rs.active) {
			if (rs.logs && Array.isArray(rs.logs)) {
				refreshLogs = rs.logs.map(item => typeof item === 'string' ? {
					time: item,
					msg: '页面已刷新'
				} : item);
				updateLogUI();
			}
			if (rs.isPowerSave) {
				setTimeout(() => {
					enablePowerSave();
				}, 300);
			}
			const now = Date.now();
			const remaining = rs.nextRefreshTime - now;
			if (remaining > 0) {
				refreshStartTimestamp = now - (refreshIntervalSec * 1000 - remaining);
				startAutoRefreshCountdown(false);
			} else {
				startAutoRefreshCountdown(true);
			}
			if (rs.running) {
				const entries = Object.entries(rs.running);
				if (entries.length > 0) {
					setTimeout(() => {
						for (const [ci, rState] of entries) {
							const ciNum = parseInt(ci);
							if (configs[ciNum].targets.length > 0) {
								startClickingFor(ciNum, rState.opStart);
								configs[ciNum].clickedCount = rState.count || 0;
							}
						}
						const c = cv();
						if (c.isRunning) countSpan.textContent = c.clickedCount;
					}, 200);
				}
			}
			clearRefreshState();
		} else if (isAutoRefresh && refreshIntervalSec >= 10) {
			startAutoRefreshCountdown(true);
		}
	})();
	setTimeout(() => {
		for (let i = 0; i < CONFIG_COUNT; i++) {
			const c = configs[i];
			if (c.isRunning) continue;
			if (c.autoStartEnabled && c.autoStartIntervalMin > 0) {
				c.autoStartNextTime = Date.now() + c.autoStartIntervalMin * 60 * 1000;
				startAutoStartCountdownTimerFor(i);
			}
		}
	}, 500);
	panel.style.visibility = '';
})();