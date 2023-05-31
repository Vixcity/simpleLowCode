import { events } from "./event";

export function useMenuDragger(data, containerRef) {
  let currentComponent = null;
  const dragenter = (e) => {
    e.dataTransfer.dropEffect = "move";
    // H5拖动的图标
  };
  const dragover = (e) => {
    e.preventDefault();
  };
  const dragleave = (e) => {
    e.dataTransfer.dropEffect = "none";
  };
  const drop = (e) => {
    // 放手的时候添加元素
    let blocks = data.value.blocks;
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true, // 松手的时候可以居中
        },
      ],
    };
    currentComponent = null;
  };

  const dragstart = (e, component) => {
    // 进入元素 -> dragenter 进入时候需要添加移动标识
    // 在元素中经过 -> dragover 需要组织元素默认行为，否则不能触发drop
    // 在元素中放手 -> dragleave 离开时候需要添加一个禁用标识
    // 离开元素 -> drop 根据拖拽的组件，添加一个组件
    containerRef.value.addEventListener("dragenter", dragenter);
    containerRef.value.addEventListener("dragover", dragover);
    containerRef.value.addEventListener("dragleave", dragleave);
    containerRef.value.addEventListener("drop", drop);
    currentComponent = component;
    events.emit('start') // 事件发布 start
  };
  const dragend = () => {
    containerRef.value.removeEventListener("dragenter", dragenter);
    containerRef.value.removeEventListener("dragover", dragover);
    containerRef.value.removeEventListener("dragleave", dragleave);
    containerRef.value.removeEventListener("drop", drop);
    events.emit('end') // 松手结束 发布一下
  };

  return { dragstart, dragend };
}
