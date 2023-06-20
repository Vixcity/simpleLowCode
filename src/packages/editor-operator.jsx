import {
  ElForm,
  ElFormItem,
  ElButton,
  ElInputNumber,
  ElColorPicker,
  ElInput,
  ElSelect,
  ElOption,
} from "element-plus";
import { defineComponent, inject } from "vue";

export default defineComponent({
  props: {
    block: { type: Object },
    data: { type: Object },
  },

  setup(props, ctx) {
    const config = inject("config");
    console.log(ctx);
    return () => {
      let content = [];
      if (!props.block) {
        content.push(
          <>
            <ElFormItem label="容器宽度">
              <ElInputNumber></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="容器高度">
              <ElInputNumber></ElInputNumber>
            </ElFormItem>
          </>
        );
      } else {
        let component = config.componentMap[props.block.key];

        if (component && component.props) {
          Object.entries(component.props).map(([propName, propConfig]) => {
            console.log(propName);
            return content.push(
              <ElFormItem label={propConfig.label}>
                {{
                  input: () => <ElInput></ElInput>,
                  color: () => <ElColorPicker></ElColorPicker>,
                  select: () => (
                    <ElSelect>
                      {propConfig.options.map((opt) => {
                        return (
                          <ElOption
                            label={opt.label}
                            value={opt.value}
                          ></ElOption>
                        );
                      })}
                    </ElSelect>
                  ),
                }[propConfig.type]()}
              </ElFormItem>
            );
          });
        }
      }

      return (
        <ElForm labelPosition="top" style="padding: 30px">
          {content}
          <ElFormItem>
            <ElButton type="primary">应用</ElButton>
            <ElButton>重置</ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  },
});
