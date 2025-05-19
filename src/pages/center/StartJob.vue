<script setup>
    import { ref, onMounted } from "vue";
    import { useGlobalState } from '../../stores/globalStore';    
    import { fetchNui } from '../../utils';    
    import { useConfirm } from "primevue/useconfirm";
    import ConfirmPopup from 'primevue/confirmpopup';
    import locale from "../../locale";
    
    const globalState = useGlobalState();
    const pageData = globalState.pageData.value;
    const confirm = useConfirm();
    const groupId = pageData.current.groupId;
    const isOwner = ref(false);
    const showPassword = ref(false);
    const isCopying = ref(false);

    const CancelJob = (groupId) => {
        globalState.pageData.value.current.args.started = false;
        globalState.pageData.value.current = null;
        globalState.changeCurrentTab('job');
        fetchNui('cancel-job', { id: groupId, owner: isOwner.value });
    }

    const LeaveJob = (groupId) => {
        globalState.pageData.value.current.args.started = false;
        globalState.pageData.value.current = null;
        globalState.changeCurrentTab('job');
        fetchNui('leave-job', { id: groupId, owner: isOwner.value });
    }

    onMounted(async () => {
        isOwner.value = await fetchNui('getIsOwner', { id: groupId });
    });

    const StartJob = (event) => {
        confirm.require({
            target: event.currentTarget,
            message: locale('jobStart', 'want_to_start_job'),
            icon: 'pi pi-exclamation-triangle',
            rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
            acceptClass: 'p-button-sm',
            rejectLabel: locale('jobStart', 'prompt_not'),
            acceptLabel: locale('jobStart', 'prompt_yes'),
            accept: async () => {
                const result = await fetchNui('start-job', { id: groupId });
                if (!result) return;
                globalState.selectJobs.value = false;
                pageData.current.args.started = true;
            },
        });
    };

    const kick = (event, player) => {
        confirm.require({
            target: event.currentTarget,
            message: locale('jobStart', 'group_kick_player_confirm'),
            icon: 'pi pi-exclamation-triangle',
            rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
            acceptClass: 'p-button-sm',
            rejectLabel: locale('jobStart', 'prompt_not'),
            acceptLabel: locale('jobStart', 'prompt_yes'),
            accept: () => {
                fetchNui("kickPlayer", { id: groupId, player: player });
            },
        });
    };

    const copyPassword = () => {
        const el = document.createElement('textarea');
        el.value = globalState.pageData.value.current.pass;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        
        isCopying.value = true;
        fetchNui('notify', {
            message: locale('jobStart', 'password_copied'),
            type: 'success'
        });
        setTimeout(() => {
            isCopying.value = false;
        }, 1000);
    };
</script>

<template>
    <div class="Container">
        <!-- Control Panel -->
        <div class="control-sidebar">
            <div class="control-card">
                <div class="card-header">
                    <div class="header-icon">
                        <i class="pi pi-cog"></i>
                    </div>
                    <div class="header-content">
                        <h2>{{ locale('jobStart', 'job_controls') }}</h2>
                        <p class="group-id">{{ locale('jobStart', 'group_id') }} #{{ groupId }}</p>
                    </div>
                </div>
                <div class="job-info">
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="pi pi-key"></i>
                        </div>
                        <div class="info-content">
                            <span class="info-label">{{ locale('jobStart', 'group_password') }}</span>
                            <div class="password-display">
                                <span>{{ showPassword ? globalState.pageData.value.current.pass : '•'.repeat(6) }}</span>
                                <div class="password-actions">
                                    <i class="pi pi-copy action-icon" 
                                       :class="{ 'copying': isCopying }" 
                                       @click="copyPassword"></i>
                                    <i class="pi action-icon" 
                                       :class="showPassword ? 'pi-eye-slash' : 'pi-eye'" 
                                       @click="showPassword = !showPassword"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="action-buttons">
                    <Button v-if="!globalState.pageData.value.current.args.started && isOwner" 
                            class="start-button" 
                            @click="StartJob($event)">
                        <i class="pi pi-play"></i>
                        <span>{{ locale('jobStart', 'group_start_job') }}</span>
                    </Button>
                    <Button v-if="globalState.pageData.value.current.args.started && isOwner"
                            class="end-button"
                            @click="LeaveJob(groupId)">
                        <i class="pi pi-power-off"></i>
                        <span>{{ locale('jobStart', 'group_end_job') }}</span>
                    </Button>
                    <Button v-if="!globalState.pageData.value.current.args.started || !isOwner"
                            class="leave-button"
                            @click="CancelJob(groupId)">
                        <i class="pi pi-times"></i>
                        <span>{{ locale('jobStart', 'group_leave_job') }}</span>
                    </Button>
                </div>
            </div>

            <div class="stats-card">
                <div class="card-header">
                    <div class="header-icon">
                        <i class="pi pi-chart-line"></i>
                    </div>
                    <h2>{{ locale('jobStart', 'job_statistics') }}</h2>
                </div>
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-icon">
                            <i class="pi pi-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <span class="stat-value">{{ globalState.pageData.value.current.args.completed }}</span>
                            <span class="stat-label">{{ locale('jobStart', 'completed_jobs') }}</span>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon">
                            <i class="pi pi-dollar"></i>
                        </div>
                        <div class="stat-content">
                            <span class="stat-value">${{ globalState.pageData.value.current.args.earnings }}</span>
                            <span class="stat-label">{{ locale('jobStart', 'total_earnings') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Members Section -->
        <div class="members-section">
            <div class="section-header">
                <div class="header-title">
                    <div class="header-icon">
                        <i class="pi pi-users"></i>
                    </div>
                    <div class="header-content">
                        <h2>{{ locale('jobStart', 'group_members_title') }}</h2>
                        <p>{{ globalState.pageData.value.current.players.length }} {{ locale('jobStart', 'active_members') }}</p>
                    </div>
                </div>
            </div>
            <div class="members-grid">
                <div v-for="(player, index) in globalState.pageData.value.current.players" 
                     :key="index"
                     class="member-card"
                     :class="{ 'owner': player.owner }">
                    <div class="member-info">
                        <div class="member-avatar">
                            <i class="pi pi-user"></i>
                        </div>
                        <div class="member-details">
                            <div class="member-name-section">
                                <span class="member-name">{{ player?.name?.full || 'NO NAME' }}</span>
                                <Tag v-if="player.owner" 
                                     severity="warning" 
                                     :value="locale('jobStart', 'group_owner_tag')" />
                            </div>
                            <span class="member-status">
                                <i class="pi pi-circle-fill"></i>
                                {{ locale('jobStart', 'status_online') }}
                            </span>
                        </div>
                    </div>
                    <Button v-if="isOwner && !player.owner"
                            class="kick-button"
                            @click="kick($event, player)">
                        <i class="pi pi-times"></i>
                    </Button>
                </div>
            </div>
            <ConfirmPopup></ConfirmPopup>
        </div>
    </div>
</template>

<style scoped lang="scss">
.Container {
    display: flex;
    gap: 2vh;
    padding: 2vh;
    height: 100%;
    width: 100%;
    color: white;
    min-height: 52vh;
    max-height: 52vh;

    .control-sidebar {
        display: flex;
        flex-direction: column;
        gap: 2vh;
        width: 30vh;

        .control-card, .stats-card {
            background: rgba(22, 27, 34, 0.95);
            border-radius: 12px;
            border: 1px solid rgba(0, 209, 245, 0.2);
            padding: 2vh;
            backdrop-filter: blur(10px);

            .card-header {
                display: flex;
                align-items: center;
                gap: 1.5vh;
                padding-bottom: 1.5vh;
                margin-bottom: 1.5vh;
                border-bottom: 1px solid rgba(0, 209, 245, 0.1);

                .header-icon {
                    width: 4vh;
                    height: 4vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 209, 245, 0.1);
                    border: 2px solid rgba(0, 209, 245, 0.2);
                    border-radius: 8px;
                    transition: all 0.3s ease;

                    i {
                        font-size: 1.8vh;
                        color: #00D1F5;
                    }
                }

                .header-content {
                    h2 {
                        margin: 0;
                        font-size: 1.6vh;
                        color: #00D1F5;
                    }

                    .group-id {
                        margin: 0.4vh 0 0;
                        font-size: 1.2vh;
                        color: rgba(255, 255, 255, 0.6);
                    }
                }
            }
        }

        .control-card {
            .job-info {
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 1.5vh;
                    padding: 1.5vh;
                    background: rgba(0, 209, 245, 0.05);
                    border: 1px solid rgba(0, 209, 245, 0.1);
                    border-radius: 8px;
                    transition: all 0.3s ease;

                    &:hover {
                        background: rgba(0, 209, 245, 0.08);
                        border-color: rgba(0, 209, 245, 0.2);
                    }

                    .info-icon {
                        width: 3.5vh;
                        height: 3.5vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(0, 209, 245, 0.1);
                        border-radius: 6px;

                        i {
                            font-size: 1.6vh;
                            color: #00D1F5;
                        }
                    }

                    .info-content {
                        flex: 1;

                        .info-label {
                            display: block;
                            font-size: 1.1vh;
                            color: rgba(255, 255, 255, 0.6);
                            margin-bottom: 0.4vh;
                        }

                        .password-display {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            font-size: 1.3vh;
                            color: white;

                            .password-actions {
                                display: flex;
                                gap: 1vh;

                                .action-icon {
                                    cursor: pointer;
                                    color: rgba(255, 255, 255, 0.6);
                                    transition: all 0.3s ease;

                                    &:hover {
                                        color: #00D1F5;
                                    }

                                    &.copying {
                                        animation: copied 1s ease;
                                        color: #00D1F5;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            .action-buttons {
                display: flex;
                flex-direction: column;
                gap: 1vh;
                margin-top: 2vh;

                .start-button, .end-button, .leave-button {
                    height: 4vh;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 1.3vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1vh;
                    transition: all 0.3s ease;

                    i {
                        font-size: 1.4vh;
                    }
                }

                .start-button {
                    background: #00D1F5;
                    color: white;

                    &:hover {
                        background: darken(#00D1F5, 5%);
                        transform: translateY(-2px);
                    }
                }

                .end-button {
                    background: #dc3545;
                    color: white;

                    &:hover {
                        background: darken(#dc3545, 5%);
                        transform: translateY(-2px);
                    }
                }

                .leave-button {
                    background: rgba(0, 209, 245, 0.1);
                    border: 1px solid rgba(0, 209, 245, 0.2);
                    color: #00D1F5;

                    &:hover {
                        background: rgba(0, 209, 245, 0.15);
                        transform: translateY(-2px);
                    }
                }
            }
        }

        .stats-card {
            .stats-grid {
                display: grid;
                gap: 1.5vh;

                .stat-box {
                    display: flex;
                    align-items: center;
                    gap: 1.5vh;
                    padding: 1.5vh;
                    background: rgba(0, 209, 245, 0.05);
                    border: 1px solid rgba(0, 209, 245, 0.1);
                    border-radius: 8px;
                    transition: all 0.3s ease;

                    &:hover {
                        background: rgba(0, 209, 245, 0.08);
                        border-color: rgba(0, 209, 245, 0.2);
                        transform: translateX(4px);
                    }

                    .stat-icon {
                        width: 4vh;
                        height: 4vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(0, 209, 245, 0.1);
                        border-radius: 8px;

                        i {
                            font-size: 1.8vh;
                            color: #00D1F5;
                        }
                    }

                    .stat-content {
                        .stat-value {
                            display: block;
                            font-size: 1.6vh;
                            font-weight: 600;
                            color: white;
                        }

                        .stat-label {
                            display: block;
                            font-size: 1.2vh;
                            color: rgba(255, 255, 255, 0.6);
                            margin-top: 0.4vh;
                        }
                    }
                }
            }
        }
    }

    .members-section {
        flex: 1;
        background: rgba(22, 27, 34, 0.95);
        border-radius: 12px;
        border: 1px solid rgba(0, 209, 245, 0.2);
        padding: 2vh;
        display: flex;
        flex-direction: column;
        backdrop-filter: blur(10px);

        .section-header {
            padding-bottom: 2vh;
            border-bottom: 1px solid rgba(0, 209, 245, 0.1);

            .header-title {
                display: flex;
                align-items: center;
                gap: 1.5vh;

                .header-icon {
                    width: 4vh;
                    height: 4vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 209, 245, 0.1);
                    border: 2px solid rgba(0, 209, 245, 0.2);
                    border-radius: 8px;

                    i {
                        font-size: 1.8vh;
                        color: #00D1F5;
                    }
                }

                .header-content {
                    h2 {
                        margin: 0;
                        font-size: 1.6vh;
                        color: #00D1F5;
                    }

                    p {
                        margin: 0.4vh 0 0;
                        font-size: 1.2vh;
                        color: rgba(255, 255, 255, 0.6);
                    }
                }
            }
        }

        .members-grid {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1vh;
            margin-top: 2vh;
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

                &:hover {
                    background: rgba(0, 209, 245, 0.4);
                }
            }

            .member-card {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5vh;
                background: rgba(0, 209, 245, 0.05);
                border: 1px solid rgba(0, 209, 245, 0.1);
                border-radius: 8px;
                transition: all 0.3s ease;

                &:hover {
                    background: rgba(0, 209, 245, 0.08);
                    border-color: rgba(0, 209, 245, 0.2);
                    transform: translateX(4px);
                }

                &.owner {
                    background: rgba(255, 193, 7, 0.1);
                    border-color: rgba(255, 193, 7, 0.2);

                    .member-avatar {
                        background: rgba(255, 193, 7, 0.1);
                        border-color: rgba(255, 193, 7, 0.2);

                        i {
                            color: #ffc107;
                        }
                    }
                }

                .member-info {
                    display: flex;
                    align-items: center;
                    gap: 1.5vh;

                    .member-avatar {
                        width: 4vh;
                        height: 4vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(0, 209, 245, 0.1);
                        border: 2px solid rgba(0, 209, 245, 0.2);
                        border-radius: 8px;

                        i {
                            font-size: 1.8vh;
                            color: #00D1F5;
                        }
                    }

                    .member-details {
                        .member-name-section {
                            display: flex;
                            align-items: center;
                            gap: 1vh;

                            .member-name {
                                font-size: 1.4vh;
                                font-weight: 500;
                                color: white;
                            }
                        }

                        .member-status {
                            display: flex;
                            align-items: center;
                            gap: 0.5vh;
                            font-size: 1.1vh;
                            color: rgba(255, 255, 255, 0.6);
                            margin-top: 0.4vh;

                            i {
                                font-size: 0.8vh;
                                color: #00D1F5;
                            }
                        }
                    }
                }

                .kick-button {
                    width: 3vh;
                    height: 3vh;
                    padding: 0;
                    background: rgba(220, 53, 69, 0.1);
                    border: 1px solid rgba(220, 53, 69, 0.2);
                    border-radius: 6px;
                    color: #dc3545;
                    transition: all 0.3s ease;

                    &:hover {
                        background: rgba(220, 53, 69, 0.2);
                        transform: scale(1.1);
                    }

                    i {
                        font-size: 1.4vh;
                    }
                }
            }
        }
    }
}

@keyframes copied {
    0% { transform: scale(1); }
    50% { transform: scale(1.3) rotate(10deg); }
    100% { transform: scale(1) rotate(0); }
}
</style>