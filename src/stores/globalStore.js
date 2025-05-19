import { ref } from 'vue';
import { createGlobalState } from '@vueuse/core';
import { fetchNui, isEnvBrowser } from '../utils';

// Mock data for development mode
const mockPageData = {
    current: {
        groupId: 1234,
        pass: "test123",
        args: {
            completed: 5,
            earnings: 1500,
            started: false
        },
        players: [
            {
                name: { full: "John Doe" },
                owner: true
            },
            {
                name: { full: "Jane Smith" },
                owner: false
            }
        ]
    },
    profile: {
        name: { full: "Test User" },
        rank: {
            Level: 2,
            XP: 750,
            Next: 1000
        }
    },
    jobs: [
        {
            label: "Bank Heist",
            description: "Rob the central bank",
            level: 1,
            icon: "bankjob"
        },
        {
            label: "Vault Break-in",
            description: "Break into the secure vault",
            level: 3,
            icon: "vaultjob"
        }
    ]
};

const mockContracts = [
    {
        title: "ATM Robbery",
        icon: "atmjob",
        bags: 3,
        level: 1,
        completed: false,
        rewards: {
            Money: { amount: 1500 }
        }
    },
    {
        title: "Bank Heist",
        icon: "bankjob",
        bags: 5,
        level: 2,
        completed: true,
        cooldownTime: Date.now() + 300000,
        leftTime: 300000,
        rewards: {
            Money: { amount: 3000 }
        }
    }
];

const mockGroups = [
    {
        groupId: 1,
        players: [{ name: { full: "Player 1" } }]
    },
    {
        groupId: 2,
        players: [{ name: { full: "Player 2" } }]
    }
];

export const useGlobalState = createGlobalState(() => {
    const visible = ref(isEnvBrowser() ? 'center' : false);
    const currentTab = ref("job");
    const pageData = ref(isEnvBrowser() ? mockPageData : {});
    const locale = ref({});
    const groups = ref(isEnvBrowser() ? mockGroups : {});
    const selectJobs = ref(false);

    const changeCurrentTab = (newTab) => {
        currentTab.value = newTab;
    };

    // Add dev buttons if in browser environment
    if (isEnvBrowser()) {
        const devControls = document.createElement('div');
        devControls.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

        const makeButton = (text, callback) => {
            const btn = document.createElement('button');
            btn.innerText = text;
            btn.style.cssText = `
                padding: 8px 16px;
                background: #3c3f41;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-family: sans-serif;
                font-size: 14px;
            `;
            btn.addEventListener('click', callback);
            return btn;
        };

        devControls.appendChild(makeButton('📱 Open Tablet', () => {
            visible.value = 'tablet';
            currentTab.value = 'contracts';
        }));

        devControls.appendChild(makeButton('🎯 Open Center', () => {
            visible.value = 'center';
            currentTab.value = 'job';
        }));

        devControls.appendChild(makeButton('❌ Hide UI', () => {
            visible.value = false;
        }));

        document.body.appendChild(devControls);

        // Inject mock contracts
        if (pageData.value) {
            pageData.value.contracts = mockContracts;
        }
    }

    window.addEventListener("message", (event) => {
        if (event.data.type == "visible") {
            visible.value = event.data.value;
        } else if (event.data.type == "pageData") {
            pageData.value = event.data.value;
            if (pageData.value.page) changeCurrentTab(pageData.value.page);
        } else if (event.data.type == "groups") {
            groups.value = event.data.value;
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key == "Escape") {
            fetchNui("close");
        }
    });

    return { visible, pageData, currentTab, changeCurrentTab, selectJobs, locale, groups };
});
