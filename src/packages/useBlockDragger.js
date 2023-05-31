import { reactive } from "vue";

export function useBlockDragger(focusData, lastSelectblock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
  };

  let markline = reactive({
    x: null,
    y: null,
  });

  const mousedown = (e) => {
    console.log(lastSelectblock.value);
    const { width: BWidth, height: BHeight } = lastSelectblock.value; // 最后拖拽的元素
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      // B 点拖拽前位置的 left 和 top
      startLeft: lastSelectblock.value.left,
      startTop: lastSelectblock.value.top,
      // 记录每一个选中的位置
      startPos: focusData.value.focus.map(({ top, left }) => ({
        top,
        left,
      })),
      lines: (() => {
        // 获取其他没选中的，在根据他们的位置做辅助线
        const { unfocus } = focusData.value;

        // 计算横线向的位置，用 Y 来存，X 存的是纵向
        let lines = { x: [], y: [] };

        [
          ...unfocus,
          {
            top: 0,
            left: 0,
            width: data.value.container.width,
            height: data.value.container.height,
          },
        ].forEach((block) => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight,
          } = block;

          // 当前元素拖拽到和A元素一致的时候，要显示这根辅助线，辅助线的位置是 ATop
          lines.y.push({ showTop: ATop, top: ATop }); // 顶对顶
          lines.y.push({ showTop: ATop, top: ATop - BHeight }); // 顶对底
          lines.y.push({
            showTop: ATop + AHeight / 2,
            top: ATop + AHeight / 2 - BHeight / 2,
          }); // 中对中
          lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }); // 底对顶
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight - BHeight,
          }); // 底对底

          // 当前元素拖拽到和A元素一致的时候，要显示这根辅助线，辅助线的位置是 ALeft
          lines.x.push({ showLeft: ALeft, left: ALeft }); // 左对左
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth }); // 右对左
          lines.x.push({
            showLeft: ALeft + AWidth / 2,
            left: ALeft + AWidth / 2 - BWidth / 2,
          }); // 中对中
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth,
          }); // 右对右
          lines.x.push({
            showLeft: ALeft,
            left: ALeft - BWidth,
          }); // 左对右
        });

        return lines;
      })(),
    };

    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };

  const mousemove = (e) => {
    let { clientX: moveX, clientY: moveY } = e;

    // 计算当前元素最新的 left 和 top，去线里面找，找到显示线
    // 鼠标移动后 - 鼠标移动前 + left
    let left = moveX - dragState.startX + dragState.startLeft;
    let top = moveY - dragState.startY + dragState.startTop;
    let y = null;
    let x = null;

    // 先计算横线，距离参照物元素还有 5px 时就显示这根线
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragState.lines.y[i]; // 取每一根线
      if (Math.abs(t - top) < 5) {
        // 接近横线
        y = s; // 线要显示的位置
        // 快速和该元素贴合在一起
        moveY = dragState.startY - dragState.startTop + t; // 容器距离顶部的距离 + 目标的高度就是最新的 moveY

        break; // 找到一根线后就跳出循环
      }
    }
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: l, showLeft: s } = dragState.lines.x[i]; // 取每一根线
      console.log(l, left);
      if (Math.abs(l - left) < 5) {
        // 接近横线
        x = s; // 线要显示的位置
        // 快速和该元素贴合在一起
        moveX = dragState.startX - dragState.startLeft + l; // 容器距离顶部的距离 + 目标的高度就是最新的 moveX

        break; // 找到一根线后就跳出循环
      }
    }
    console.log(x);
    markline.x = x; // markline 是一个响应式数据，如果它更新了，视图就会更新
    markline.y = y;

    let durX = moveX - dragState.startX; // 之前和之后的距离
    let durY = moveY - dragState.startY;

    focusData.value.focus.forEach((block, index) => {
      block.top = dragState.startPos[index].top + durY;
      block.left = dragState.startPos[index].left + durX;
    });
  };

  const mouseup = () => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
    markline.x = null
    markline.y = null
  };

  return { mousedown, markline };
}
