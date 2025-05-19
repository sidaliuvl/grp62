<script setup>
    import { useGlobalState } from '../../stores/globalStore';
    import { useConfirm } from "primevue/useconfirm";
    import { fetchNui } from '../../utils';
    import { ref, onMounted } from "vue";

    import ConfirmPopup from 'primevue/confirmpopup';
    import locale from "../../locale";

    const globalState = useGlobalState();
    const pageData = globalState.pageData.value;
    const confirm = useConfirm();

    const TakeContract = (event, index, contract) => {
        confirm.require({
            target: event.currentTarget,            
            message: locale('tablet', 'take_contract_confirm'),
            icon: 'pi pi-exclamation-triangle',
            rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
            acceptClass: 'p-button-sm',
            rejectLabel: locale('tablet', 'prompt_no'),
            acceptLabel: locale('tablet', 'prompt_yes'),
            accept: async () => {               
                const result = await fetchNui("takeContract", contract);
                if (!result) return;
                pageData.contracts[index] = result; 
            }
        });
    };

    const displayTime = (time) => {
        var totalSeconds = Math.floor(time / 1000);
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        var formattedHours = String(hours).padStart(2, '0');
        var formattedMinutes = String(minutes).padStart(2, '0');
        var formattedSeconds = String(seconds).padStart(2, '0');

        return formattedHours + ':' + formattedMinutes + ':' + formattedSeconds;
    }

    const updateCooldowns = () => {
        setInterval(async () => {
            let data = pageData.contracts
            for (const key in data) {
                let contract = pageData.contracts[key]
                if (contract.completed) {
                    if (contract.leftTime >= 0) {
                        contract.leftTime = (contract.cooldownTime * 1000) - Date.now()
                    } else {
                        contract.cooldownTime = 0;
                        contract.leftTime = 0;
                        contract.completed = false;
                    }
                }
            }
        }, 1000);
    };

    onMounted(() => {
        updateCooldowns();
    });
</script>

<template>
    <div class="contracts-container">
        <div class="contracts-wrapper">
            <!-- Header -->
            <div class="contracts-header">
                <div class="header-content">
                    <div class="header-main">
                        <div class="title-icon">
                            <i class="pi pi-file-edit"></i>
                        </div>
                        <div class="header-text">
                            <h3>{{ locale('tablet', 'active_calls') }}</h3>
                            <span class="subtitle">{{ locale('tablet', 'available_contracts') }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contracts Grid -->
            <div class="contracts-content">
                <div class="contracts-grid">
                    <template v-if="pageData.contracts.length > 0">
                        <div v-for="(contract, index) in pageData.contracts" 
                             :key="index"
                             class="contract-card"
                             :class="{ 'locked': pageData.profile.rank.Level < contract.level || contract.completed }">
                            <div class="contract-content">
                                <div class="contract-icon">
                                    <img :src="`https://cfx-nui-peuren_gruppe6/web/dist/${contract.icon}.png`" :alt="contract.title">
                                </div>
                                <div class="contract-info">
                                    <h4>{{ contract.title }}</h4>
                                    <div class="contract-stats">
                                        <div class="stat-item">
                                            <i class="pi pi-shopping-bag"></i>
                                            <span>{{ contract.bags }} {{ locale('tablet', 'contract_bags') }}</span>
                                        </div>
                                        <div class="stat-item">
                                            <i class="pi pi-money-bill"></i>
                                            <span>${{ contract.rewards.Money.amount }}</span>
                                        </div>
                                    </div>
                                    <Button @click="TakeContract($event, index, contract)" 
                                            class="take-contract-btn">
                                        <i class="pi pi-check"></i>
                                        <span>{{ locale('tablet', 'contract_take') }}</span>
                                    </Button>
                                </div>
                            </div>
                            <div v-if="pageData.profile.rank.Level < contract.level || contract.completed" 
                                 class="lock-overlay">
                                <i :class="pageData.profile.rank.Level < contract.level ? 'pi pi-lock' : 'pi pi-clock'"></i>
                                <Tag :icon="pageData.profile.rank.Level < contract.level ? 'pi pi-star' : 'pi pi-clock'" 
                                     severity="warning" 
                                     :value="pageData.profile.rank.Level < contract.level ? 
                                            contract.level + ' lvl' : 
                                            displayTime(contract.leftTime)" />
                            </div>
                        </div>
                    </template>
                    <div v-else class="no-contracts">
                        <div class="no-contracts-content">
                            <i class="pi pi-info-circle"></i>
                            <h3>{{ locale('tablet', 'no_active_calls') }}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ConfirmPopup></ConfirmPopup>
    </div>
</template>

<style scoped lang="scss">
.contracts-container {
    display: flex;
    padding: 2vh;
    height: 100%;
    width: 100%;
    color: white;
    min-height: 52vh;
    max-height: 52vh;

    .contracts-wrapper {
        flex: 1;
        background-color: rgb(32, 32, 32);
        border-radius: 0.8vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .contracts-header {
            background-color: rgb(32, 32, 32);
            padding: 2vh;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);

            .header-content {
                .header-main {
                    display: flex;
                    align-items: center;
                    gap: 1.5vh;

                    .title-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 5vh;
                        height: 5vh;
                        background: rgba(87, 182, 87, 0.1);
                        border: 2px solid rgba(87, 182, 87, 0.2);
                        border-radius: 0.8vh;

                        i {
                            font-size: 2.2vh;
                            color: rgb(87, 182, 87);
                        }
                    }

                    .header-text {
                        h3 {
                            margin: 0;
                            font-size: 2vh;
                            font-weight: 600;
                        }

                        .subtitle {
                            font-size: 1.3vh;
                            color: rgba(255, 255, 255, 0.5);
                        }
                    }
                }
            }
        }

        .contracts-content {
            flex: 1;
            overflow-y: auto;
            padding: 2vh;

            &::-webkit-scrollbar {
                width: 0.4vh;
            }

            &::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 1vh;
            }

            &::-webkit-scrollbar-thumb {
                background: rgba(87, 182, 87, 0.3);
                border-radius: 1vh;

                &:hover {
                    background: rgba(87, 182, 87, 0.4);
                }
            }

            .contracts-grid {
                display: grid;
                gap: 2vh;

                .contract-card {
                    position: relative;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.8vh;
                    overflow: hidden;
                    transition: all 0.2s ease;

                    &:hover {
                        transform: translateY(-0.2vh);
                        background: rgba(255, 255, 255, 0.08);
                    }

                    .contract-content {
                        padding: 2vh;
                        display: flex;
                        gap: 2vh;

                        .contract-icon {
                            width: 12vh;
                            height: 10vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: rgba(255, 255, 255, 0.03);
                            border-radius: 0.6vh;

                            img {
                                max-width: 100%;
                                max-height: 100%;
                                object-fit: contain;
                            }
                        }

                        .contract-info {
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            gap: 1vh;

                            h4 {
                                margin: 0;
                                font-size: 1.6vh;
                                font-weight: 600;
                            }

                            .contract-stats {
                                display: flex;
                                gap: 2vh;

                                .stat-item {
                                    display: flex;
                                    align-items: center;
                                    gap: 0.8vh;
                                    padding: 0.8vh 1.2vh;
                                    background: rgba(255, 255, 255, 0.05);
                                    border-radius: 0.4vh;

                                    i {
                                        font-size: 1.4vh;
                                        color: rgb(87, 182, 87);
                                    }

                                    span {
                                        font-size: 1.3vh;
                                        color: rgb(200, 200, 200);
                                    }
                                }
                            }

                            .take-contract-btn {
                                margin-top: auto;
                                align-self: flex-start;
                                height: 4vh;
                                padding: 0 2vh;
                                background: rgb(87, 182, 87);
                                border: none;
                                border-radius: 0.6vh;
                                color: white;
                                font-size: 1.4vh;
                                font-weight: 600;
                                display: flex;
                                align-items: center;
                                gap: 1vh;
                                transition: all 0.2s ease;

                                &:hover {
                                    background: darken(rgb(87, 182, 87), 5%);
                                    transform: translateY(-0.2vh);
                                }

                                i {
                                    font-size: 1.4vh;
                                }
                            }
                        }
                    }

                    .lock-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(32, 32, 32, 0.9);
                        backdrop-filter: blur(0.5vh);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 1vh;

                        i {
                            font-size: 3vh;
                            color: rgba(255, 255, 255, 0.3);
                        }
                    }
                }

                .no-contracts {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4vh;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.8vh;
                    text-align: center;

                    .no-contracts-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 1vh;

                        i {
                            font-size: 3vh;
                            color: rgb(87, 182, 87);
                        }

                        h3 {
                            margin: 0;
                            font-size: 1.8vh;
                            font-weight: 600;
                        }
                    }
                }
            }
        }
    }
}
</style>