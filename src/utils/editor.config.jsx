// 列表区，可以显示所有的物料
// key对应的组件映射关系

import { ElButton, ElInput } from "element-plus";

function createEditConfig() {
  const componentList = [];
  const componentMap = {};

  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component);
      componentMap[component.key] = component;
    },
  };
}

export let registerConfig = createEditConfig();
const createInputProp = (label) => ({ type: "input", label });
const createColorProp = (label) => ({ type: "color", label });
const createSelectProp = (label, options) => ({
  type: "select",
  label,
  options,
});
registerConfig.register({
  label: "文本",
  preview: () => "预览文本",
  render: () => "渲染文本",
  key: "text",
  props: {
    text: createInputProp("文本内容"),
    color: createColorProp("字体颜色"),
    size: createSelectProp("字体大小", [
      {
        label: "14px",
        value: "14px",
      },
      {
        label: "16px",
        value: "16px",
      },
      {
        label: "18px",
        value: "18px",
      },
      {
        label: "20px",
        value: "20px",
      },
      {
        label: "22px",
        value: "22px",
      },
      {
        label: "24px",
        value: "24px",
      },
    ]),
  },
});
registerConfig.register({
  label: "按钮",
  preview: () => <ElButton>预览按钮</ElButton>,
  render: () => <ElButton>渲染按钮</ElButton>,
  key: "button",
  props: {
    text: createInputProp("按钮内容"),
    type: createSelectProp("按钮类型", [
      {
        label: "基础按钮",
        value: "primary",
      },
      {
        label: "成功按钮",
        value: "success",
      },
      {
        label: "警告按钮",
        value: "warning",
      },
      {
        label: "危险按钮",
        value: "danger",
      },
      {
        label: "文本",
        value: "text",
      },
    ]),
    size: createSelectProp("按钮大小", [
      {
        label: "默认",
        value: "",
      },
      {
        label: "中等",
        value: "medium",
      },
      {
        label: "小",
        value: "small",
      },
      {
        label: "极小",
        value: "mini",
      },
    ]),
  },
});
registerConfig.register({
  label: "输入框",
  preview: () => <ElInput placeholder="预览输入框"></ElInput>,
  render: () => <ElInput placeholder="渲染输入框"></ElInput>,
  key: "input",
});
