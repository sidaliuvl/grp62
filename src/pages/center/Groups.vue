<script setup>
    import { useGlobalState } from '../../stores/globalStore';    
    import { fetchNui } from '../../utils';
    import { ref, computed } from "vue";
    import locale from "../../locale";
    import Dialog from 'primevue/dialog';
    import InputText from 'primevue/inputtext';
    
    const globalState = useGlobalState();
    const searchQuery = ref('');

    const filteredGroups = computed(() => {
        if (!searchQuery.value) return globalState.groups.value;
        return globalState.groups.value.filter(group => 
            group.groupId.toString().includes(searchQuery.value.toLowerCase())
        );
    });

    const showPasswordDialog = ref(false);
    const selectedGroupId = ref(null);
    const password = ref('');

    const openPasswordDialog = (groupId) => {
        selectedGroupId.value = groupId;
        password.value = '';
        showPasswordDialog.value = true;
    };

    const joinGroup = async () => {
        const result = await fetchNui('enter-group', { 
            id: selectedGroupId.value, 
            password: password.value 
        });
        
        if (!result) return;
        showPasswordDialog.value = false;
        globalState.current.value = result;
        globalState.changeCurrentTab("start-job");
    }
</script>

<template>
    <div class="groups-container">
        <!-- Search and Header Section -->
        <div class="header-section">
            <div class="title-section">
                <div class="icon-wrapper">
                    <i class="pi pi-users"></i>
                </div>
                <div class="text-content">
                    <h2>{{ locale('groups', 'groups_header_title') }}</h2>
                    <p>{{ locale('groups', 'subtitle') }}</p>
                </div>
            </div>
            <div class="search-wrapper">
                <i class="pi pi-search"></i>
                <input 
                    v-model="searchQuery"
                    type="text"
                    :placeholder="locale('groups', 'search_groups')"
                >
            </div>
        </div>

        <!-- Groups List -->
        <div class="groups-list">
            <template v-if="filteredGroups.length > 0">
                <div v-for="(item, index) in filteredGroups" 
                     :key="index" 
                     class="group-card">
                    <div class="group-info">
                        <div class="group-icon">
                            <i class="pi pi-users"></i>
                        </div>
                        <div class="group-details">
                            <div class="group-header">
                                <h3>{{ locale('groups', 'group_title') + " " + item.groupId }}</h3>
                                <Tag icon="pi pi-users" 
                                     :value="item.players.length + ' Members'"
                                     severity="info" />
                            </div>
                            <div class="status-badge">
                                <i class="pi pi-circle-fill"></i>
                                <span>{{ locale('groups', 'active_status') }}</span>
                            </div>
                        </div>
                    </div>
                    <Button @click="openPasswordDialog(item.groupId)" 
                            class="join-btn">
                        <i class="pi pi-sign-in"></i>
                        <span>{{ locale('home', 'join_group') }}</span>
                    </Button>
                </div>
            </template>
            <div v-else class="no-groups">
                <i class="pi pi-info-circle"></i>
                <h3>{{ locale('groups', 'no_groups_title') }}</h3>
                <p>{{ locale('groups', 'no_groups_description') }}</p>
            </div>
        </div>

        <!-- Password Dialog -->
        <Dialog v-model:visible="showPasswordDialog" 
                :modal="true"
                :header="locale('groups', 'enter_password')"
                class="password-dialog">
            <div class="password-input-container">
                <span class="p-float-label">
                    <InputText v-model="password" 
                              type="password"
                              @keyup.enter="joinGroup"
                              autofocus />
                    <label>{{ locale('groups', 'group_password') }}</label>
                </span>
            </div>
            <template #footer>
                <Button @click="showPasswordDialog = false" 
                        class="cancel-btn">
                    {{ locale('groups', 'cancel') }}
                </Button>
                <Button @click="joinGroup" 
                        class="confirm-btn">
                    {{ locale('groups', 'join') }}
                </Button>
            </template>
        </Dialog>
    </div>
</template>

<style scoped lang="scss">
.groups-container {
    display: flex;
    flex-direction: column;
    gap: 2vh;
    padding: 2vh;
    height: 100%;
    width: 100%;
    color: white;
    min-height: 52vh;
    max-height: 52vh;
    background: rgba(22, 27, 34, 0.95);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1vh;

        .title-section {
            display: flex;
            align-items: center;
            gap: 1.5vh;

            .icon-wrapper {
                width: 5vh;
                height: 5vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 209, 245, 0.1);
                border: 2px solid rgba(0, 209, 245, 0.2);
                border-radius: 10px;
                transition: all 0.3s ease;

                i {
                    font-size: 2.2vh;
                    color: #00D1F5;
                }

                &:hover {
                    transform: scale(1.05);
                    border-color: #00D1F5;
                }
            }

            .text-content {
                h2 {
                    margin: 0;
                    font-size: 2vh;
                    color: #00D1F5;
                }

                p {
                    margin: 0.5vh 0 0;
                    font-size: 1.2vh;
                    color: rgba(255, 255, 255, 0.6);
                }
            }
        }

        .search-wrapper {
            display: flex;
            align-items: center;
            gap: 1vh;
            background: rgba(0, 209, 245, 0.05);
            border: 1px solid rgba(0, 209, 245, 0.2);
            border-radius: 8px;
            padding: 0 1.5vh;
            height: 4vh;
            width: 25vh;
            transition: all 0.3s ease;

            i {
                color: #00D1F5;
                font-size: 1.4vh;
            }

            input {
                flex: 1;
                background: none;
                border: none;
                color: white;
                font-size: 1.3vh;
                outline: none;

                &::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
            }

            &:focus-within {
                border-color: #00D1F5;
                box-shadow: 0 0 15px rgba(0, 209, 245, 0.1);
            }
        }
    }

    .groups-list {
        flex: 1;
        overflow-y: auto;
        padding-right: 1vh;

        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-track {
            background: rgba(0, 209, 245, 0.05);
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(0, 209, 245, 0.3);
            border-radius: 4px;
        }

        .group-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(0, 209, 245, 0.05);
            border: 1px solid rgba(0, 209, 245, 0.1);
            border-radius: 10px;
            padding: 1.5vh;
            margin-bottom: 1vh;
            transition: all 0.3s ease;

            &:hover {
                transform: translateX(5px);
                border-color: #00D1F5;
                background: rgba(0, 209, 245, 0.08);
            }

            .group-info {
                display: flex;
                align-items: center;
                gap: 1.5vh;

                .group-icon {
                    width: 5vh;
                    height: 5vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 209, 245, 0.1);
                    border: 2px solid rgba(0, 209, 245, 0.2);
                    border-radius: 8px;

                    i {
                        font-size: 2vh;
                        color: #00D1F5;
                    }
                }

                .group-details {
                    .group-header {
                        display: flex;
                        align-items: center;
                        gap: 1vh;

                        h3 {
                            margin: 0;
                            font-size: 1.6vh;
                            color: white;
                        }

                        :deep(.p-tag) {
                            background: rgba(0, 209, 245, 0.1);
                            border: 1px solid rgba(0, 209, 245, 0.2);
                            color: #00D1F5;
                            font-size: 1.1vh;
                        }
                    }

                    .status-badge {
                        display: flex;
                        align-items: center;
                        gap: 0.5vh;
                        margin-top: 0.5vh;
                        font-size: 1.1vh;
                        color: rgba(255, 255, 255, 0.6);

                        i {
                            color: #00D1F5;
                            font-size: 0.8vh;
                        }
                    }
                }
            }

            .join-btn {
                background: transparent;
                border: 2px solid #00D1F5;
                color: #00D1F5;
                border-radius: 8px;
                padding: 1vh 2vh;
                display: flex;
                align-items: center;
                gap: 0.8vh;
                transition: all 0.3s ease;

                i {
                    font-size: 1.4vh;
                }

                span {
                    font-size: 1.3vh;
                    font-weight: 600;
                }

                &:hover {
                    background: #00D1F5;
                    color: white;
                    transform: translateY(-2px);
                }
            }
        }

        .no-groups {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 30vh;
            text-align: center;
            color: rgba(255, 255, 255, 0.6);

            i {
                font-size: 3vh;
                color: #00D1F5;
                margin-bottom: 1vh;
            }

            h3 {
                margin: 0;
                font-size: 1.8vh;
                color: white;
            }

            p {
                margin: 1vh 0 0;
                font-size: 1.3vh;
                max-width: 30vh;
            }
        }
    }
}

.password-dialog {
    :deep(.p-dialog) {
        background: rgba(22, 27, 34, 0.98);
        border: 1px solid rgba(0, 209, 245, 0.2);
        border-radius: 12px;
        backdrop-filter: blur(10px);
    }

    :deep(.p-dialog-header) {
        background: transparent;
        border-bottom: 1px solid rgba(0, 209, 245, 0.1);
        padding: 1.5vh;

        .p-dialog-title {
            color: #00D1F5;
            font-size: 1.6vh;
        }
    }

    :deep(.p-dialog-content) {
        background: transparent;
        padding: 2vh;

        .password-input-container {
            input {
                width: 100%;
                background: rgba(0, 209, 245, 0.05);
                border: 1px solid rgba(0, 209, 245, 0.2);
                border-radius: 8px;
                color: white;
                padding: 1vh;
                font-size: 1.4vh;

                &:focus {
                    border-color: #00D1F5;
                    outline: none;
                }
            }

            label {
                color: rgba(255, 255, 255, 0.6);
            }
        }
    }

    :deep(.p-dialog-footer) {
        background: transparent;
        border-top: 1px solid rgba(0, 209, 245, 0.1);
        padding: 1.5vh;
        display: flex;
        gap: 1vh;

        .cancel-btn {
            background: transparent;
            border: 1px solid rgba(0, 209, 245, 0.2);
            color: rgba(255, 255, 255, 0.6);
        }

        .confirm-btn {
            background: #00D1F5;
            border: none;
            color: white;

            &:hover {
                background: darken(#00D1F5, 5%);
                transform: translateY(-2px);
            }
        }

        button {
            padding: 0.8vh 1.5vh;
            border-radius: 6px;
            font-size: 1.3vh;
            transition: all 0.3s ease;
        }
    }
}
</style>