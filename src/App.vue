<script setup>
  import { useGlobalState } from "./stores/globalStore";

  import CenterHeader from "./components/center/Header.vue";
  import Home from "./pages/center/Home.vue";
  import StartJob from "./pages/center/StartJob.vue";
  import Rank from "./pages/center/Rank.vue";
  import Group from "./pages/center/Groups.vue";
  import Contracts from "./pages/tablet/Contracts.vue";
  import locale from "./locale";

  const globalState = useGlobalState();
</script>

<template>
  <div class="Center" v-if="globalState.visible.value == 'center'">
    <div class="Content">
      <CenterHeader v-if="globalState.currentTab.value != 'current'" />
      <div class="Contents">
        <Home v-if="globalState.currentTab.value == 'job'" />
        <StartJob v-if="globalState.currentTab.value == 'start-job'" />
        <Rank v-if="globalState.currentTab.value == 'rank'" />
        <Group v-if="globalState.currentTab.value == 'join-group'" />
      </div>
    </div>
  </div>
  <div class="Tablet" v-if="globalState.visible.value == 'tablet'">
    <div class="tablet-window">
      <div class="window-header">
        <div class="left-controls">
          <img src="/header.png" alt="Logo" class="header-logo" />
          <span class="header-title">Gruppe6</span>
        </div>
        <div class="window-controls">
          <button class="control minimize">
            <i class="pi pi-minus"></i>
          </button>
          <button class="control close">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
      <div class="Content">
        <Contracts v-if="globalState.currentTab.value == 'contracts'" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .Tablet {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);

    .tablet-window {
      width: 85vh;
      background-color: rgb(15, 15, 15);
      border-radius: 0.8vh;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);

      .window-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgb(22, 27, 34);
        padding: 0.8vh;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        -webkit-app-region: drag;

        .left-controls {
          display: flex;
          align-items: center;
          gap: 1vh;

          .header-logo {
            width: 2vh;
            height: 2vh;
          }

          .header-title {
            color: #e6edf3;
            font-size: 1.4vh;
            font-weight: 500;
          }
        }

        .window-controls {
          display: flex;
          gap: 0.5vh;

          .control {
            width: 2.2vh;
            height: 2.2vh;
            border: none;
            border-radius: 0.3vh;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            -webkit-app-region: no-drag;

            i {
              font-size: 1.2vh;
              color: #e6edf3;
            }

            &.minimize {
              background: #505050;
              &:hover { background: #606060; }
            }

            &.close {
              background: #ff4444;
              &:hover { background: #ff6666; }
            }
          }
        }
      }

      .Content {
        display: flex;
        align-items: center;
        flex-flow: column;
        height: calc(100% - 3.8vh);
        background-color: rgb(15, 15, 15);
      }
    }
  }

  .Center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;

    .Content {
      display: flex;
      align-items: center;
      flex-flow: column;
      width: 90vh;
      background-color: rgb(15, 15, 15);
      border-radius: 0.5vh;

      .Contents {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 52vh;
        width: 100%;
      }
    }
  }
</style>