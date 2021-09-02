"use strict"; // eslint-disable-line strict
(function () {
    /**
     * Vimium C 生命周期回调函数，在 https://github.com/gdh1995/vimium-c/blob/master/content/injected_end.ts 中调用
     *
     * @argument {number} action_code 1: "initing", 2: "complete", 3: "destroy"
     */
    const VimiumCHandler = (action_code) => {
        if (action_code === 2) {
            // 初始化完成
            const api = window.VApi;
            const oldScroll = api.$;
            if (typeof oldScroll === "function") {
                /**
                 * 接管滚动命令，用于全屏模式下立即翻页（忽略平滑滚动）
                 */
                api.$ = (element, di, amount) => {
                    if (
                        element.id === "viewerContainer" &&
                        element.classList.contains("pdfPresentationMode")
                    ) {
                        element.dispatchEvent(
                            new WheelEvent("wheel", {
                                bubbles: true,
                                cancelable: true,
                                composed: true,
                                deltaY: Math.sign(amount) * 120,
                            })
                        );
                    } else {
                        oldScroll.call(this, element, di, amount);
                    }
                };
            }
            /**
             * 返回 PDF 文件的 URL，用于复制网页地址等命令
             */
            api.u = () => {
                const file = new URLSearchParams(location.search).get("file");
                return file || location.href;
            };
        } else if (action_code === 3) {
            // 停止
            window.removeEventListener("vimiumMark", onMark, true);
        }
    };

    /**
     * 设置或者获取“文档滚动位置”，在 https://github.com/gdh1995/vimium-c/blob/master/content/marks.ts#L10 中调用
     *
     * @argument {CustomEvent} event
     */
    const onMark = (event) => {
        const channelElement = event.relatedTarget;
        const box = channelElement && document.getElementById("viewerContainer");
        event.stopImmediatePropagation();
        if (!box) {
            return;
        }
        const str = channelElement.textContent;
        if (str) {
            // 对应命令 Marks.activate
            const mark = str.split(",");
            const position = [~~mark[0], ~~mark[1]];
            if (position[0] > 0 || position[1] > 0) {
                box.scrollTo(position[0], position[1]);
                channelElement.textContent = "";
                event.preventDefault();
            }
        } else {
            // 对应命令 Marks.activateCreate
            channelElement.textContent = [box.scrollLeft, box.scrollTop];
        }
    };
    const browser_ = typeof browser === "object" && browser && browser.runtime ? browser : chrome

    browser_.storage.sync.get("vimiumExtensionInjector").then((result) => {
        let injector = result.vimiumExtensionInjector;
        if (injector === "nul" || injector === "/dev/null") {
            return;
        }
        if (!injector) {
            injector = /\sEdg\//.test(navigator.appVersion)
                ? "aibcglbfblnogfjhbcmmpobjhnomhcdo"
                : typeof InstallTrigger !== "undefined"
                ? "vimium-c@gdh1995.cn"
                : "hfjbmagddngcpeloejdejnfgbamkjaeg";
            browser_.storage.sync.set({ vimiumExtensionInjector: injector });
        }
        if (injector.includes("://") && injector.includes("/", injector.indexOf("://") + 3)) {
            inject(injector);
            return;
        }
        let extId;
        try {
            if (injector.includes("://")) {
                extId = new URL(injector).hostname;
            } else {
                extId = injector;
            }
        } catch (_e) {
            return;
        }
        browser_.runtime.sendMessage(extId, { handler: "id" }).then((response) => {
            if (!response || !response.injector || typeof response.injector !== "string") {
                if (response === false) {
                    console.log("Connection to the extension named %o was refused.", extId);
                }
                return;
            }
            console.log(
                `Successfully connected to ${extId}: %o (version ${response.version}).`,
                response.name
            );
            inject(response.injector);
        }, () => {});
    });

    const inject = (url) => {
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = () => {
            // 在 https://github.com/gdh1995/vimium-c/blob/master/lib/injector.ts#L87 处定义
            const injector = window.VimiumInjector;
            if (injector) {
                injector.cache
                    ? VimiumCHandler(2, "complete")
                    : (injector.callback = VimiumCHandler);
                window.addEventListener("vimiumMark", onMark, true);
            }
        };
        document.head.appendChild(script);
    };
})();
