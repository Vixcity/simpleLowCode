import deepcopy from "deepcopy";
import { events } from "./event";
import { onUnmounted } from "vue";

export function useCommand(data, focusData) {
  const state = {
    // 前进后退需要指针
    current: -1, // 前进后退的索引值
    queue: [], // 存放所有的操作命令
    commands: {}, // 制作命令和执行功能的一个映射表
    commandArray: [], // 存放所有的命令
    destoryArray: [],
  };

  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => {
      // 命令名字对应执行函数
      const { redo, undo } = command.execute(...args);
      redo();
      if (!command.pushQueue) {
        // 不需要放到队列中直接逃过即可
        return;
      }
      let { queue, current } = state;

      if (queue.length > 0) {
        // 在放置的过程中，可能有撤销操作，根据当前最新的current值来计算新的值
        queue = queue.slice(0, current + 1);
        state.queue = queue;
      }

      queue.push({ redo, undo }); // 保存指令的前进与后退
      state.current += 1;
      console.log(queue);
    };
  };

  // 注册需要的命令
  registry({
    name: "redo",
    keyboard: "ctrl+y",
    execute() {
      return {
        redo() {
          let item = state.queue[state.current + 1]; // 找到当前的下一步，还原操作
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  });

  registry({
    name: "undo",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          if (state.current == -1) return; // 没有可以撤销的了
          let item = state.queue[state.current]; // 找到上一步还原
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        },
      };
    },
  });

  registry({
    // 希望将操作放到队列中，可以增加一个属性标识，等会儿要放到队列中
    name: "drag",
    pushQueue: true,
    init() {
      // 初始化操作，默认执行
      this.before = null;
      // 监控拖拽开始事件，保存状态
      const start = () => {
        this.before = deepcopy(data.value.blocks);
      };
      // 监控之后需要触发对应的指令
      const end = () => {
        state.commands.drag();
      };
      events.on("start", start);
      events.on("end", end);

      return () => {
        events.off("start", start);
        events.off("end", end);
      };
    },

    execute() {
      let before = this.before;
      let after = data.value.blocks;
      return {
        redo() {
          // 后一步的
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          // 前一步的
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });

  registry({
    // 更新整个容器
    name: "updateContainer",
    pushQueue: true,
    execute(newVal) {
      let stete = {
        // 当前的值
        before: data.value,
        // 新值
        after: newVal,
      };
      return {
        redo: () => {
          data.value = stete.after;
        },
        undo: () => {
          data.value = stete.before;
        },
      };
    },
  });

  registry({
    // 置顶操作
    name: "placeTop",
    pushQueue: true,
    execute() {
      let before = deepcopy(data.value.blocks);
      let after = (() => {
        // 置顶就是在所有的block中找到最大的
        let { focus, unfocus } = focusData.value;
        let maxZIndex = unfocus.reduce((prev, block) => {
          return Math.max(prev, block.zIndex);
        }, -Infinity);

        // 让当前选中的比最大的+1
        focus.forEach((block) => (block.zIndex = maxZIndex + 1));
        return data.value.blocks;
      })();
      return {
        redo: () => {
          data.value = { ...data.value, blocks: after };
        },
        undo: () => {
          // 如果当前的blocks前后一致，则不会更新，所以在之前会深拷贝一份
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });

  registry({
    // 置底操作
    name: "placeBottom",
    pushQueue: true,
    execute() {
      let before = deepcopy(data.value.blocks);
      let after = (() => {
        // 置底就是在所有的block中找到最小的
        let { focus, unfocus } = focusData.value;
        let minZIndex =
          unfocus.reduce((prev, block) => {
            return Math.min(prev, block.zIndex);
          }, Infinity) - 1;

        // 这里不能直接 - 1，因为index不能出现负数，否则就看不到了
        if (minZIndex < 0) {
          // 如果是负的，则让没选中的向上，自己变成0
          const dur = Math.abs(minZIndex);
          minZIndex = 0;
          unfocus.forEach((block) => (block.zIndex += dur));
        }

        // 控制选中的值
        focus.forEach((block) => (block.zIndex = minZIndex));
        return data.value.blocks;
      })();
      return {
        redo: () => {
          data.value = { ...data.value, blocks: after };
        },
        undo: () => {
          // 如果当前的blocks前后一致，则不会更新，所以在之前会深拷贝一份
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });

  registry({
    // 删除
    name: "delete",
    pushQueue: true,
    execute() {
      let state = {
        before: deepcopy(data.value.blocks),
        // 选中的都删除了，留下的就是没选中的
        after: focusData.value.unfocus,
      };
      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after };
        },
        undo: () => {
          data.value = { ...data.value, blocks: state.before };
        },
      };
    },
  });

  const keyboardEvent = (() => {
    const onKeyDown = (e) => {
      const keyCodes = {
        90: "z",
        89: "y",
      };
      const { ctrlKey, keyCode } = e; // 判断组合是否为 ctrl + z
      let keyString = [];
      if (ctrlKey) keyString.push("ctrl");
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join("+");

      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return;
        if (keyboard === keyString) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };
    const init = () => {
      window.addEventListener("keydown", onKeyDown);
      return () => {
        // 销毁事件
        removeEventListener("keydown", onKeyDown);
      };
    };
    return init;
  })();

  !(() => {
    // 监听键盘事件
    state.destoryArray.push(keyboardEvent());

    state.commandArray.forEach(
      (command) => command.init && state.destoryArray.push(command.init())
    );
  })();

  onUnmounted(() => {
    // 清理绑定的事件
    state.destoryArray.forEach((fn) => fn && fn());
  });
  return state;
}
