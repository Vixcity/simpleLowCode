/* eslint-disable vue/multi-word-component-names */
import { ElDialog, ElInput, ElButton } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      isShow: false,
      // 用户给组件的属性
      option: props.option,
    });

    ctx.expose({
      // 让外界可以调用组件的方法
      showDialog(option) {
        state.option = option;
        state.isShow = true;
      },
    });

    const onCancel = () => {
      state.isShow = false;
    };
    const onConfirm = () => {
      state.option.onConfirm && state.option.onConfirm(state.option.content);
      onCancel()
    };

    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.title}>
          {{
            default: () => (
              <ElInput
                type="textarea"
                v-model={state.option.content}
                rows={10}
              ></ElInput>
            ),
            footer: () =>
              state.option.footer && (
                <div>
                  <ElButton onClick={onCancel}>取消</ElButton>
                  <ElButton type="primary" onClick={onConfirm}>
                    确定
                  </ElButton>
                </div>
              ),
          }}
        </ElDialog>
      );
    };
  },
});

let vm;
export function $dialog(option) {
  // element-plus 中有 dialog 组件
  // 手动挂载组件
  if (!vm) {
    let el = document.createElement("div");
    // 创建虚拟节点
    vm = createVNode(DialogComponent, { option });

    // 渲染成真实节点，扔到页面中
    document.body.appendChild((render(vm, el), el));
  }

  // 将组件渲染到el元素上
  // 其他说明组件已经有了，只需要显示出来
  let { showDialog } = vm.component.exposed;
  showDialog(option);
}
