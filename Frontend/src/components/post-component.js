class HorrorPost extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const user = this.getAttribute('user') || 'Anónimo';
        const handle = this.getAttribute('handle') || '@anon';
        const time = this.getAttribute('time') || 'ahora';
        const content = this.getAttribute('content') || '';
        const avatar = this.getAttribute('avatar') || '/Frontend/src/assets/imagenes/M.jpg';
        const comments = this.getAttribute('comments') || '0';
        const repost = this.getAttribute('repost') || '0';
        const likes = this.getAttribute('likes') || '0';

        this.innerHTML = `
            

            <div class="bg-gray-800 rounded-xl p-6 space-y-3 overflow-hidden">

                <!-- Header usuario -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img class="w-10 h-10 rounded-full" src="${avatar}" alt="${user}">
                        <div>
                            <div class="text-sm font-bold text-white">${user}</div>
                            <div class="text-xs text-gray-500">${handle} · ${time}</div>
                        </div>
                    </div>

                    <button type="button" class="flex items-center justify-center p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                        <svg class="w-5 h-5 text-white stroke-current fill-none">
                            <use href="/Frontend/src/assets/sprite.svg#icon-ellipsis"></use>
                        </svg>
                    </button>
                </div>

                <!-- Contenido -->
                <div class="text-sm text-gray-200 leading-relaxed">
                    ${content}
                </div>

                <!-- Reacciones -->
                <div class="flex w-ful h-10 py-2 text-sm text-gray-500 gap-4">
                
                    <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5 stroke-current fill-none">
                            <use href="/Frontend/src/assets/sprite.svg#icon-message"></use>
                        </svg>
                        <span>${comments}</span>
                    </div>

                    <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5 stroke-current fill-none">
                            <use href="/Frontend/src/assets/sprite.svg#icon-repeat"></use>
                        </svg>
                        <span>${repost}</span>
                    </div>

                    <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5 stroke-current fill-none">
                            <use href="/Frontend/src/assets/sprite.svg#icon-heart"></use>
                        </svg>
                        <span>${likes}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('horror-post', HorrorPost);
