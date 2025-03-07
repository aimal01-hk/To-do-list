const app = {
    data() {
        return {
            email: localStorage.getItem('currentUser') || '', // Get current user email from localStorage
            password: '',
            isLoggedIn: !!localStorage.getItem('currentUser'), // Check if the user is logged in based on localStorage
            tasks: [],
            newTask: '',
            selectedDate: new Date().toISOString().split('T')[0], // Default to today's date
            filter: 'all' // Filter for tasks (all, active, completed, inProgress)
        };
    },
    computed: {
        filteredTasks() {
            const dateFilteredTasks = this.tasks.filter(task => task.date === this.selectedDate);
            // Apply the filter for active, completed, and in-progress tasks
            return dateFilteredTasks.filter(task => {
                if (this.filter === 'active') return !task.completed && !task.inProgress;
                if (this.filter === 'completed') return task.completed;
                if (this.filter === 'inProgress') return task.inProgress;
                return true; // Return all tasks if no filter is applied
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
            if (this.email.trim() && this.password.trim()) {
                localStorage.setItem('currentUser', this.email); // Store the user session in localStorage
                this.loadTasks(); // Load tasks after successful login
                this.isLoggedIn = true; // Update login status
            }
        },
        logout() {
            localStorage.removeItem('currentUser'); // Remove user session from localStorage
            this.email = '';
            this.password = '';
            this.isLoggedIn = false; // Update login status
            this.tasks = []; // Clear tasks when logged out
        },
        loadTasks() {
            const storedTasks = localStorage.getItem(`tasks_${this.email}`);
            // Load the tasks from localStorage or initialize as an empty array if no tasks are found
            this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
        },
        addTask() {
            if (this.newTask.trim()) {
                this.tasks.push({
                    id: Date.now(), // Generate a unique ID for each task
                    text: this.newTask,
                    date: this.selectedDate, // Associate task with selected date
                    completed: false,
                    inProgress: false
                });
                this.newTask = ''; // Clear input after adding task
                this.saveTasks(); // Save tasks to localStorage
            }
        },
        toggleStatus(task) {
            // Toggle the task status between inProgress, completed, and none
            if (!task.completed && !task.inProgress) {
                task.inProgress = true;
            } else if (task.inProgress) {
                task.inProgress = false;
                task.completed = true;
            } else {
                task.completed = false;
            }
            this.saveTasks(); // Save updated tasks
        },
        deleteTask(taskId) {
            this.tasks = this.tasks.filter(task => task.id !== taskId); // Remove task by ID
            this.saveTasks(); // Save updated tasks
        },
        saveTasks() {
            localStorage.setItem(`tasks_${this.email}`, JSON.stringify(this.tasks)); // Save tasks to localStorage
        }
    },
    watch: {
        selectedDate() {
            this.loadTasks();  // Reload tasks when selectedDate changes (ensures tasks are always up-to-date)
        }
    },
    template: `
        <div class="todo-app p-6 max-w-2xl mx-auto ">
            <div v-if="!isLoggedIn" class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-xl font-bold mb-4 text-center">Login</h2>
                <input type="email" v-model="email" placeholder="Enter your email" class="w-full p-2 border rounded mb-3">
                <input type="password" v-model="password" placeholder="Enter password" class="w-full p-2 border rounded mb-3">
                <button @click="login" class="w-full bg-blue-500 text-white p-2 rounded">Login</button>
            </div>

            <div v-else class="todo-app">
                <div class="mb-4 flex justify-between">
                    <h2 class="text-xl font-bold">Welcome {{ email }}</h2>
                    <button @click="logout" class="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
                </div>

                <div class="mb-6 flex items-center space-x-2 w-full">
                    <input type="date" v-model="selectedDate" class="px-4 py-2 border rounded-lg">
                    <input type="text" v-model="newTask" @keyup.enter="addTask" placeholder="Add new task..." class="flex-grow px-4 py-2 border rounded-lg truncate">
                    <button @click="addTask" class="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg flex justify-between shrink-0 w-32">Add Task</button>
                </div>

                <div class="mb-4 flex space-x-2">
                    <button @click="filter = 'all'" :class="{ 'bg-blue-400 font-bold text-white': filter === 'all' }" class="px-5  py-1 rounded">All to Conquer 💪✨</button>
                    <button @click="filter = 'active'" :class="{ 'bg-yellow-500 font-bold text-white': filter === 'active' }" class="px-3 py-1 rounded">I’ll crush it today!🚀</button>
                    <button @click="filter = 'inProgress'" :class="{ 'bg-orange-500 font-bold text-white': filter === 'inProgress' }" class="mr-2 px-3 py-1 rounded">I’m smashing it!🔥</button>
                    <button @click="filter = 'completed'" :class="{ 'bg-green-500 font-bold text-white': filter === 'completed' }" class="mr-2 px-3 py-1 rounded">Mission Completed😎</button>
                </div>

                <div v-if="filteredTasks.length === 0" class="text-center text-white font-bold">
                    No tasks for this day. Add a new one! <!-- Message when no tasks are present for the selected date -->
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
