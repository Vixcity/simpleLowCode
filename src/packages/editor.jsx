import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditBlock from "./editor-block";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";

export default defineComponent({
  name: "EditorContent",
  props: {
    modelValue: {
      type: Object,
    },
  },
  emits: ["update:modelValue"], // 要触发的事件
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newVal) {
        ctx.emit("update:modelValue", deepcopy(newVal));
      },
    });

    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    const config = inject("config");
    // console.log(config);

    const containerRef = ref(null);

    // 1. 实现菜单拖拽功能
    const { dragstart, dragend } = useMenuDragger(data, containerRef);
    // 2. 获取焦点
    let { blockMousedown, focusData, containerMousedown, lastSelectblock } =
      useFocus(data, (e) => {
        mousedown(e);
      });
    let { mousedown, markline } = useBlockDragger(focusData, lastSelectblock, data);

    // 3. 实现拖拽多个元素的功能

    return () => (
      <div class="editor">
        <div class="editor-top">菜单栏</div>
        {/* 左侧边栏，根据注册列表渲染对应的内容 可以实现H5的拖拽*/}
        <div class="editor-left">
          {config.componentList.map((component) => (
            <div
              class="editor-left-item"
              draggable
              onDragstart={(e) => dragstart(e, component)}
              onDragend={dragend}
            >
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div class="editor-right">属性控制栏</div>
        <div class="editor-container">
          {/* 负责产生滚动条 */}
          <div class="editor-container-canvas">
            {/* 内容产生区域 */}
            <div
              class="editor-container-canvas__content"
              style={containerStyles.value}
              ref={containerRef}
              onMousedown={containerMousedown}
            >
              {markline.x !== null && (
                <div class="line-x" style={{ left: markline.x + "px" }}></div>
              )}
              {markline.y !== null && (
                <div class="line-y" style={{ top: markline.y + "px" }}></div>
              )}
              {/* 内容区 */}
              {data.value.blocks.map((block, index) => (
                <EditBlock
                  class={block.focus ? "editor-block-focus" : ""}
                  block={block}
                  onMousedown={(e) => blockMousedown(e, block, index)}
                ></EditBlock>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
