import { computed, defineComponent, inject, onMounted, ref } from "vue";

export default defineComponent({
  props: {
    block: { type: Object },
  },
  setup(props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`,
    }));
    const config = inject("config");

    const blockRef = ref(null);
    onMounted(() => {
      // console.log(blockRef.value);
      let { offsetWidth, offsetHeight } = blockRef.value;
      if (props.block.alignCenter) {
        // 说明是拖拽松手的时候才渲染的，其他默认渲染页面的内容，不需要居中
        // 下面这俩原则上应该通过事件，去更改它的值，但是这里改起来比较麻烦，就直接改了
        // eslint-disable-next-line vue/no-mutating-props
        props.block.left = props.block.left - offsetWidth / 2;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.top = props.block.top - offsetHeight / 2;

        // 渲染完成后的结果才能去居中
        // eslint-disable-next-line vue/no-mutating-props
        props.block.alignCenter = false;
      }
      // eslint-disable-next-line vue/no-mutating-props
      props.block.width = offsetWidth
      // eslint-disable-next-line vue/no-mutating-props
      props.block.height = offsetHeight
    });

    return () => {
      // 通过block的key直接获取对应组件
      const component = config.componentMap[props.block.key];
      // 获取render函数
      const RenderComponent = component.render();
      return (
        <div class="editor-block" ref={blockRef} style={blockStyles.value}>
          {RenderComponent}
        </div>
      );
    };
  },
});
