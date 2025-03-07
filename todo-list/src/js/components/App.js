const app = {
    data() {
        return {
            username: '',
            email: localStorage.getItem('currentUser') || '', 
            password: '',
            isLoggedIn: !!localStorage.getItem('currentUser'), 
            tasks: [],
            newTask: '',
            selectedDate: new Date().toISOString().split('T')[0], 
            filter: 'all' 
        };
    },
    computed: {
        filteredTasks() {
            const dateFilteredTasks = this.tasks.filter(task => task.date === this.selectedDate);
            return dateFilteredTasks.filter(task => {
                if (this.filter === 'active') return !task.completed && !task.inProgress;
                if (this.filter === 'completed') return task.completed;
                if (this.filter === 'inProgress') return task.inProgress;
                return true; 
            });
        },
        taskStats() {
            const tasksForDate = this.tasks.filter(task => task.date === this.selectedDate);
            return {
                total: tasksForDate.length,
                completed: tasksForDate.filter(t => t.completed).length,
                inProgress: tasksForDate.filter(t => t.inProgress).length
            };
        }
    },
    methods: {
    login() {
        if (this.username.trim() && this.email.trim() && this.password.trim()) {
            localStorage.setItem('currentUser', this.email); 
            localStorage.setItem('currentUsername', this.username); 
            this.loadTasks(); 
            this.isLoggedIn = true; 
        }
    },
    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUsername');
        this.username = '';
        this.email = '';
        this.password = '';
        this.isLoggedIn = false; 
        this.tasks = []; 
    },
    loadTasks() {
        const storedTasks = localStorage.getItem(`tasks_${this.email}`);
        this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
    },
    addTask() {
        if (this.newTask.trim()) {
            this.tasks.push({
                id: Date.now(),
                text: this.newTask,
                date: this.selectedDate,
                completed: false,
                inProgress: false
            });
            this.newTask = '';
            this.saveTasks();
        }
    },
    openDatePicker() {
        this.$refs.dateInput.showPicker(); 
    },
    toggleStatus(task) {
        if (!task.completed && !task.inProgress) {
            task.inProgress = true;
        } else if (task.inProgress) {
            task.inProgress = false;
            task.completed = true;
        } else {
            task.completed = false;
        }
        this.saveTasks();
    },
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId); 
        this.saveTasks();
    },
    saveTasks() {
        localStorage.setItem(`tasks_${this.email}`, JSON.stringify(this.tasks)); 
    }
},
watch: {
    selectedDate() {
        this.loadTasks();  
    }
},

    template: `
        <div class="todo-app p-6 max-w-2xl mx-auto">
            <div v-if="!isLoggedIn" class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-xl font-bold mb-4 text-center">Login</h2>
                <!-- New Username Field -->
                <input type="text" v-model="username" placeholder="Enter your username" class="w-full p-2 border rounded mb-3">
                <input type="email" v-model="email" placeholder="Enter your email" class="w-full p-2 border rounded mb-3">
                <input type="password" v-model="password" placeholder="Enter password" class="w-full p-2 border rounded mb-3"  @keyup.enter="login">
                <button @click="login" class="w-full bg-blue-500 text-white p-2 rounded">Login</button>
            </div>

            <div v-else>
                <div class="mb-4 flex justify-between">
                    <h2 class="text-xl font-bold">Welcome {{ username }}</h2>
                    <button @click="logout" class="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
                </div>

                <div class="mb-6 flex items-center space-x-2 w-full">
                    <input type="date" v-model="selectedDate" class="px-4 py-2 border rounded-lg" @focus="openDatePicker" ref="dateInput">
                    <input type="text" v-model="newTask" @keyup.enter="addTask" placeholder="Add new task..." class="flex-grow px-4 py-2 border rounded-lg truncate">
                    <button @click="addTask" class="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg shrink-0 w-32">Add Task</button>
                </div>

                <div class="mb-4 flex space-x-2">
                    <button @click="filter = 'all'" :class="{ 'bg-blue-400 font-bold text-white': filter === 'all' }" class="px-5 text- py-1 rounded">All to Conquer 💪✨</button>
                    <button @click="filter = 'active'" :class="{ 'bg-yellow-500 font-bold text-white': filter === 'active' }" class="px-3 py-1 rounded">I’ll crush it today!🚀</button>
                    <button @click="filter = 'inProgress'" :class="{ 'bg-orange-500 font-bold text-white': filter === 'inProgress' }" class="mr-2 px-3 py-1 rounded">I’m smashing it!🔥</button>
                    <button @click="filter = 'completed'" :class="{ 'bg-green-500 font-bold text-white': filter === 'completed' }" class="mr-2 px-3 py-1 rounded">Mission Completed😎</button>
                </div>

                <div v-if="filteredTasks.length === 0" class="text-center text-white font-bold">
                    No tasks for this day. Add a new one!
                </div>

                <ul class="space-y-2">
                    <li v-for="task in filteredTasks" :key="task.id" class="flex items-center justify-between p-3 bg-white rounded-lg shadow max-w-2xl mx-auto">
                        <div>
                            <span :class="{
                                'line-through text-green-400 ': task.completed,
                                'text-orange-500 font-bold': task.inProgress,
                                'item-text': true
                            }">
                                {{ task.text }}
                            </span>
                            <div class="text-sm text-gray-500">{{ task.date }}</div>
                        </div>
                        <div class="flex space-x-2">
                            <button @click="toggleStatus(task)" :class="{
                                'bg-green-500': task.completed,
                                'bg-orange-500': task.inProgress,
                                'bg-gray-500': !task.completed && !task.inProgress
                            }" class="px-2 py-1 text-white rounded-lg mr-2 ">
                                {{ task.completed ? '✓' : task.inProgress ? '⟳' : '▶' }}
                            </button>
                            <button @click="deleteTask(task.id)" class="bg-red-500 text-white px-2 py-1 rounded-lg">
                                ×
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    `
};

export default app;
