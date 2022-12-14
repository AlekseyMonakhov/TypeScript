/// <reference path="base-components.ts"/>
/// <reference path="../decorators/autobind.ts"/>
/// <reference path="../state/project-state.ts"/>
/// <reference path="../models/project.ts"/>
/// <reference path="../models/drug-drop.ts"/>

// Project list class
namespace App {
    export class ProjectList extends Component<HTMLDivElement, HTMLElement>
        implements DragTarget{

        assignedProjects: Project[];
        constructor(private type:"active" | "finished") {
            super("project-list", "app",false,`${type}-projects`);
            this.assignedProjects = [];

            this.configure();
            this.renderContent();
        }
        @AutoBind
        dragOverHandler(event: DragEvent) {
            if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                const listEl = this.element.querySelector('ul')!;
                listEl.classList.add('droppable');

            }

        }
        @AutoBind
        dropHandler(event: DragEvent) {
            const prjId = event.dataTransfer!.getData('text/plain');
            projectState.moveProject(
                prjId,
                this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
            );

        }
        @AutoBind
        dragLeaveHandler(_: DragEvent) {
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.remove('droppable');
        }

        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            this.element.addEventListener('drop', this.dropHandler);

            projectState.addListener((projects:Project[]) => {
                const relevantProjects = projects.filter((project:Project) => {
                    if (this.type === 'active') {
                        return project.status === ProjectStatus.Active;
                    }
                    return project.status === ProjectStatus.Finished;
                })
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            })
        }

        renderContent() {
            const listId =`${this.type}-projects-list`;
            this.element.querySelector("ul")!.id = listId;
            this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + "PROJECTS";
        }

        private renderProjects() {
            const listEL = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
            listEL.innerHTML = ''; // hello to React =)
            for (const prjItems of this.assignedProjects) {
                new ProjectItem(this.element.querySelector('ul')!.id, prjItems);
            }
        }


    }
}