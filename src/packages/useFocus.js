import { computed, ref } from "vue";

export function useFocus(data, previewRef, callback) {
  let selectIndex = ref(-1); // 表示没有任何一个被选中
  // 最后选择的那一个
  let lastSelectblock = computed(() => data.value.blocks[selectIndex.value]);

  const focusData = computed(() => {
    let focus = [];
    let unfocus = [];
    data.value.blocks.forEach((block) =>
      (block.focus ? focus : unfocus).push(block)
    );
    return { focus, unfocus };
  });

  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => {
      block.focus = false;
    });
  };

  const blockMousedown = (e, block, index) => {
    console.log(previewRef.value);
    if (previewRef.value) return;
    e.preventDefault();
    e.stopPropagation();
    //block 上我们需要定义一个属性 focus, 获取焦点以后需要把 focus 变成 true
    if (e.shiftKey) {
      if (focusData.value.focus.length <= 1) {
        block.focus = true;
        // 当前只有一个节点被选中时，按住 shift 键，也不会切换 focus 状态
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        clearBlockFocus();
        block.focus = true; // 要清空其他人的 focus 属性
        // 当已经被选中的时候，再次点击还是选中
      }
    }
    selectIndex.value = index;
    callback(e);
  };

  const containerMousedown = () => {
    if (previewRef.value) return;
    clearBlockFocus();
    selectIndex.value = -1;
  };

  return {
    blockMousedown,
    focusData,
    containerMousedown,
    lastSelectblock,
    clearBlockFocus,
  };
}
