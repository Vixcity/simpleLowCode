import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditBlock from "./editor-block";
import EditorOperator from "./editor-operator";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { $dialog } from "@/components/Dialog";

export default defineComponent({
  name: "EditorContent",
  props: {
    modelValue: {
      type: Object,
    },
  },
  emits: ["update:modelValue"], // 要触发的事件
  setup(props, ctx) {
    // 预览的时候，内容不能再操作了，可以点击，输入内容，方便看效果
    const previewRef = ref(false);

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
    let {
      blockMousedown,
      focusData,
      containerMousedown,
      lastSelectblock,
      clearBlockFocus,
    } = useFocus(data, previewRef, (e) => {
      mousedown(e);
    });
    let { mousedown, markline } = useBlockDragger(
      focusData,
      lastSelectblock,
      data
    );

    const { commands } = useCommand(data, focusData);
    const buttons = [
      {
        label: "撤销",
        icon: "iconfont icon-chexiao",
        handler: () => commands.undo(),
      },
      {
        label: "重做",
        icon: "iconfont icon-zhongzuo",
        handler: () => commands.redo(),
      },
      {
        label: "导出",
        icon: "iconfont icon-daochu",
        handler: () => {
          $dialog({
            title: "导出JSON",
            content: JSON.stringify(data.value),
          });
        },
      },
      {
        label: "导入",
        icon: "iconfont icon-daoru",
        handler: () => {
          $dialog({
            title: "导入JSON",
            content: "",
            footer: true,
            onConfirm(text) {
              // 这样去更改无法保留历史记录
              // data.value = JSON.parse(text)
              commands.updateContainer(JSON.parse(text));
            },
          });
        },
      },
      {
        label: "置顶",
        icon: "iconfont icon-zhiding",
        handler: () => commands.placeTop(),
      },
      {
        label: "置底",
        icon: "iconfont icon-xiangxiazhidi",
        handler: () => commands.placeBottom(),
      },
      {
        label: "删除",
        icon: "iconfont icon-shanchu",
        handler: () => commands.delete(),
      },
      {
        label: () => (previewRef.value ? "编辑" : "预览"),
        icon: () =>
          previewRef.value
            ? "iconfont icon-wenbenshuru"
            : "iconfont icon-yulan",
        handler: () => {
          previewRef.value = !previewRef.value;
          clearBlockFocus();
        },
      },
    ];

    console.log(commands);

    return () => (
      <div class="editor">
        <div class="editor-top">
          {buttons.map((btn) => {
            const icon = typeof btn.icon === "function" ? btn.icon() : btn.icon;
            const label =
              typeof btn.label === "function" ? btn.label() : btn.label;
            return (
              <div class="editor-top-button" onClick={btn.handler}>
                <i class={icon}></i>
                <span> {label}</span>
              </div>
            );
          })}
        </div>
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
        <div class="editor-right">
          <EditorOperator block={lastSelectblock.value} data={data.value}></EditorOperator>
        </div>
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
                  class={previewRef.value ? "editor-block-preview" : block.focus ? "editor-block-focus" : ""}
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
