//Drag & Drop Interfaces

interface Draggable {
    dragStartHandler(event:DragEvent): void;
    dragEndHandler(event:DragEvent):void;
}

interface DragTarget {
    dragOverHandler(event:DragEvent):void;
    dropHandler(event:DragEvent):void;
    dragLeaveHandler(event:DragEvent):void;
}

//Project type

enum ProjectStatus {
    Active,
    Finished,
}
class Project {
    constructor(
       public id:string,
       public title:string,
       public description: string,
       public people:number,
       public status: ProjectStatus
    ) {}
}




// Project state Management
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners:Listener<T>[] =[];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State<Project>{

    private projects:Project[] = [];
    private static instance: ProjectState;
    private constructor() {
        super();
    }
    static getInstance() {
        if(this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return  this.instance;
    }


    addProject(title:string, description: string, numberOfPeople:number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numberOfPeople,
            ProjectStatus.Active
        );
        this.projects.push(newProject);
        this.updateListeners();
    }
    moveProject(projectId:string, newStatus: ProjectStatus) {
        const project = this.projects.find((prj) => prj.id === projectId);
        if(project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    private updateListeners() {
        for(const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();
//
function AutoBind(_:any, _2:string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    const adjDescriptor = {
        enumerable: false,
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor
}


// validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}
function validate(validatableInput : Validatable) {
    let isValid = true;
    if(validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if(
        validatableInput.maxLength != null &&
        typeof validatableInput.value === "string")
    {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
    }
    if(validatableInput.min != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if(validatableInput.max != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}

// Component Base Class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;
    constructor(
        templatedId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string
    ) {
        this.templateElement =
            <HTMLTemplateElement>document.getElementById(templatedId)!;
        this.hostElement =
            document.getElementById(hostElementId)! as T;

        const importedNode =
            document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;

        if(newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }

    private attach(insertAtStart:boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.element);
    }
    abstract configure(): void;
    abstract renderContent(): void;
}

// Project Item

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable{
    private project: Project;

    get persons() {
        if(this.project.people === 1) {
            return `1 person`
        }else{
            return `${this.project.people} persons`
        }
    }
    constructor(hostId:string, project:Project) {
        super('single-project', hostId, false,  project.id);
        this.project = project;

        this.configure()
        this.renderContent()
    }
    @AutoBind
    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData('text/plain',this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
        console.log('drag start')
    }

    dragEndHandler(_: DragEvent) {
        console.log("Drag end")
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragEndHandler)
    }
    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}

// Project list class
class ProjectList extends Component<HTMLDivElement, HTMLElement>
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

//Project input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;
    constructor() {
        super("project-input", 'app',true,'user-input');

        this.titleInputElement =this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement =this.element.querySelector("#description") as HTMLInputElement;
        this.peopleInputElement =this.element.querySelector("#people") as HTMLInputElement;

        this.configure();
    };
    configure() {
        this.element.addEventListener("submit",this.submitHandler)
    }
    renderContent() {
    }


    private gatherUserInput():  [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true,
        }
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5,
        }
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if(
           !validate(titleValidatable) ||
           !validate(descriptionValidatable) ||
           !validate(peopleValidatable)
        ) {
            alert("Invalid input")
        }else{
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
    @AutoBind
    private submitHandler( event:Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)){
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInput();
        }
    }

}

const prjInput = new ProjectInput();
const activeProjectList =new ProjectList('active');
const finishedProjectList =new ProjectList('finished');