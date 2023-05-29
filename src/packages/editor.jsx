import { computed, defineComponent, inject } from "vue";
import "./editor.scss";
import EditBlock from "./editor-block";

export default defineComponent({
  name: "EditorContent",
  props: {
    modelValue: {
      type: Object,
    },
  },
  setup(props) {
    const data = computed({
      get() {
        return props.modelValue;
      },
    });

    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    const config = inject("config");
    console.log(config)

    return () => (
      <div class="editor">
        <div class="editor-top">菜单栏</div>
        {/* 左侧边栏，根据注册列表渲染对应的内容 */}
        <div class="editor-left">
          {config.componentList.map((component) => (
            <div class="editor-left-item">
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
            >
              {/* 内容区 */}
              {data.value.blocks.map((block) => (
                <EditBlock block={block}></EditBlock>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
