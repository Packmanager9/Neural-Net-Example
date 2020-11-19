
window.addEventListener('DOMContentLoaded', (event) => {
    let canvas
    let canvas_context
    let keysPressed = {}
    function setUp(canvas_pass, style = "#000000") {
        canvas = canvas_pass
        canvas_context = canvas.getContext('2d');
        canvas.style.background = style
        window.setInterval(function () {
            main()
        }, 1)
        document.addEventListener('keydown', (event) => {
            keysPressed[event.key] = true;
        });
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
        });
    }
    function getRandomColor() { // random color
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 16) + 0)];
        }
        return color;
    }
    let setup_canvas = document.getElementById('canvas') //getting canvas from document
    setUp(setup_canvas) // setting up canvas refrences, starting timer. 
    class Perceptron {
        constructor(inputs) {
            this.inputs = [...inputs]
            this.weights = []
            this.bias = (Math.random() - .5) * .01
            for (let t = 0; t < this.inputs.length; t++) {
                this.weights.push(this.weight())
            }
            this.value = this.compute()
        }
        compute() {
            let value = this.bias
            for (let t = 0; t < this.inputs.length; t++) {
                value += this.inputs[t] * this.weights[t]
            }
            return value
        }
        weight() {
            return (Math.random() - .5) * 2
        }
        clone(inputs) {
            let clone = new Perceptron(inputs)
            clone.inputs = [...inputs]
            clone.weights = [...this.weights]
            clone.value = clone.compute()
            clone.bias = this.bias
            return clone
        }
        mutate() {
            for (let t = 0; t < this.weights.length; t++) {
                if (Math.random() < mutationrate) {
                    this.weights[t] += (.2 * (Math.random() - .5))
                }
                if (Math.random() < mutationrate) {
                    this.weights[t] *= -1
                }
                if (Math.random() < mutationrate) {
                    this.weights[t] *= 0
                }
                if (Math.random() < mutationrate) {
                    this.weights[t] = this.weight()
                }
                if (Math.random() < mutationrate) {
                    this.weights[t] *= 1 + ((Math.random() - .5) * .5)
                }
                if (Math.random() < mutationrate) {
                    this.bias = (Math.random() - .5) * .01
                }
            }

        }
    }
    class GenNN {
        constructor(inputs, layercount, layersetupArray, outputs = 2) {
            this.name = getRandomColor()
            this.fitness = 0
            this.correct = 0
            this.wrong = 0
            this.parent = this.name
            this.generation = 0
            this.inputs = [...inputs]
            this.layercount = layercount
            this.layersetupArray = [...layersetupArray]
            this.tempinputs = [...inputs]
            this.structure = []
            for (let t = 0; t < this.layercount; t++) {
                let nodes = []
                for (let k = 0; k < this.layersetupArray[t]; k++) {
                    let node = new Perceptron([...this.tempinputs])
                    nodes.push(node)
                }
                this.structure.push(nodes)
                this.tempinputs = []
                this.tempclone = []
                for (let g = 0; g < this.structure[this.structure.length - 1].length; g++) {
                    this.tempinputs.push(this.structure[this.structure.length - 1][g].value)
                    this.tempclone.push(this.structure[this.structure.length - 1][g].value)
                }
                for (let n = 0; n < this.tempinputs.length; n++) {
                    this.tempinputs[n] = this.normalize(this.tempinputs[n], Math.min(...this.tempclone), Math.max(...this.tempclone)) //optional
                }
            }
            this.outputs = this.layersetupArray[this.layersetupArray.length - 1]
            this.outputMagnitudes = []
            this.outputMagnitudesClone = []
            for (let t = 0; t < this.outputs; t++) {
                this.outputMagnitudes.push(this.tempinputs[t])
                this.outputMagnitudesClone.push(this.tempinputs[t])
            }
            this.outputSum = 0
            for (let t = 0; t < this.outputs; t++) {
                this.outputMagnitudes[t] = this.normalize(this.outputMagnitudes[t], Math.min(...this.outputMagnitudesClone), Math.max(...this.outputMagnitudesClone))
                this.outputSum += this.outputMagnitudes[t]
            }
            this.outputSum = 1 / this.outputSum
            for (let t = 0; t < this.outputs; t++) {
                this.outputMagnitudes[t] *= this.outputSum
            }
            this.r = 128 //Math.random()*255
            this.g = 128 //Math.random()*255
            this.b = 128 //Math.random()*255
            this.name = `rgb(${this.r},${this.g},${this.b})`
        }
        clone() {
            let clone = new GenNN(this.inputs, this.layercount, this.layersetupArray, 4)
            for (let t = 0; t < this.structure.length; t++) {
                for (let k = 0; k < this.structure[t].length; k++) {
                    for (let p = 0; p < this.structure[t][k].weights.length; p++) {
                        clone.structure[t][k].weights[p] = this.structure[t][k].weights[p]
                    }
                }
            }
            clone.generation = this.generation + 1
            clone.r = Math.round(Math.max(Math.min((this.r+((Math.random()-.5)*36)), 255), 0))
            clone.g = Math.round(Math.max(Math.min((this.g+((Math.random()-.5)*36)), 255), 0))
            clone.b = Math.round(Math.max(Math.min((this.b+((Math.random()-.5)*36)), 255), 0))
            clone.parent = this.name
            clone.name = `rgb(${clone.r},${clone.g},${clone.b})`
            return clone
        }
        mutate() {
            for (let t = 0; t < this.structure.length; t++) {
                for (let k = 0; k < this.structure[t].length; k++) {
                    this.structure[t][k].mutate()
                }
            }
            this.changeInputs(this.inputs)
        }
        changeInputs(inputs) {
            this.inputs = [...inputs]
            this.tempinputs = [...inputs]
            this.structureclone = []
            for (let t = 0; t < this.structure.length; t++) {
                this.structureclone[t] = []
                for (let k = 0; k < this.structure[t].length; k++) {
                    this.structureclone[t].push(this.structure[t][k].clone(this.tempinputs))
                }
                this.tempinputs = []
                this.tempclone = []
                for (let g = 0; g < this.structureclone[this.structureclone.length - 1].length; g++) {
                    this.tempinputs.push(this.structureclone[this.structureclone.length - 1][g].value)
                    this.tempclone.push(this.structureclone[this.structureclone.length - 1][g].value)
                }
                for (let n = 0; n < this.tempinputs.length; n++) {
                    this.tempinputs[n] = this.normalize(this.tempinputs[n], Math.min(...this.tempclone), Math.max(...this.tempclone))//optional
                }
            }
            this.outputs = this.layersetupArray[this.layersetupArray.length - 1]
            this.outputMagnitudes = []
            this.outputMagnitudesClone = []
            for (let t = 0; t < this.outputs; t++) {
                this.outputMagnitudes.push(this.tempinputs[t])
                this.outputMagnitudesClone.push(this.tempinputs[t])
            }
            this.outputSum = 0
            for (let t = 0; t < this.outputs; t++) {
                this.outputMagnitudes[t] = this.normalize(this.outputMagnitudes[t], Math.min(...this.outputMagnitudesClone), Math.max(...this.outputMagnitudesClone))
                this.outputSum += this.outputMagnitudes[t]
            }
            this.outputSum = 1 / this.outputSum
            for (let t = 0; t < this.outputs; t++) {
                this.outputMagnitudes[t] *= this.outputSum
            }
            this.structure = this.structureclone
        }
        normalize(val, min, max) {
            if (min < 0) {
                max += 0 - min;
                val += 0 - min;
                min = 0;
            }
            val = val - min;
            max = max - min;
            return Math.max(0, Math.min(1, val / max));
        }
    }
    let redval = Math.random() + 0
    let greenval = Math.random() + 0
    let blueval = Math.random() + 0
    let meshes = []
    for (let t = 0; t < 1000; t++) {
        let SandMesh = new GenNN([redval, blueval, greenval, redval, blueval, greenval, redval, blueval, greenval], 3, [27, 9, 3], 4)
        meshes.push(SandMesh)
    }
    let counter = 1
    let counterstop = 100
    let mutationrate = .005
    let difficulty = 0
    function main() {
        if (counter % counterstop == 0) {
            console.log(meshes[0].name, 100 * (meshes[0].wrong / (meshes[0].correct + meshes[0].wrong)), `${meshes[0].wrong}/${meshes[0].correct + meshes[0].wrong}`)
            canvas.style.background = meshes[0].name
            difficulty++
            counterstop += (difficulty * Math.round(difficulty * .2))
            counter = 0
            console.log(difficulty, "difficulty")
            for (let t = 0; t < meshes.length; t++) {
                meshes[t].fitness *= .5
                meshes[t].fitness = Math.round(meshes[t].fitness)
            }
        }
        counter++
        for (let t = 0; t < meshes.length; t++) {
            if (redval > greenval && redval > blueval) {
                if (meshes[t].outputMagnitudes[0] > meshes[t].outputMagnitudes[1] && meshes[t].outputMagnitudes[0] > meshes[t].outputMagnitudes[2]) {
                    meshes[t].marked = 0
                    meshes[t].fitness += 1
                    meshes[t].correct += 1
                } else {
                    meshes[t].fitness -= difficulty
                    meshes[t].wrong += 1
                }
            } else if (greenval > redval && greenval > blueval) {
                if (meshes[t].outputMagnitudes[1] > meshes[t].outputMagnitudes[0] && meshes[t].outputMagnitudes[1] > meshes[t].outputMagnitudes[2]) {
                    meshes[t].marked = 0
                    meshes[t].fitness += 1
                    meshes[t].correct += 1
                } else {
                    meshes[t].fitness -= difficulty
                    meshes[t].wrong += 1
                }
            } else if (blueval > redval && blueval > greenval) {
                if (meshes[t].outputMagnitudes[2] > meshes[t].outputMagnitudes[0] && meshes[t].outputMagnitudes[2] > meshes[t].outputMagnitudes[1]) {
                    meshes[t].marked = 0
                    meshes[t].fitness += 1
                    meshes[t].correct += 1
                } else {
                    meshes[t].fitness -= difficulty
                    meshes[t].wrong += 1
                }
            }
            if (meshes[t].fitness < 0) {
                meshes[t].marked = 1
            }
        }
        meshes = meshes.filter(mesh => mesh.marked == 0)
        meshes.sort((a, b) => (a.fitness < b.fitness) ? 1 : -1)
        let x = 0
        let y = 0
        for(let t = 0;t <meshes.length;t++){
            canvas_context.fillStyle = meshes[t].name
            canvas_context.fillRect(x,y,  35,35)
            x+=35
            if(x  == 700){
                x = 0
                y+=35
            }
           if(t> 400){
               break
           }
        }
        meshes.splice(395,5)
        if (meshes.length == 0) {
            let SandMesh = new GenNN([redval, blueval, greenval, redval, blueval, greenval, redval, blueval, greenval], 3, [27, 9, 3], 4)
            meshes.push(SandMesh)
        } else {
            for (let t = 0; meshes.length < 400; t++) {
                let SandMesh = meshes[0].clone()
                SandMesh.mutate()
                meshes.push(SandMesh)
            }
        }
        if (keysPressed['f']) {
            console.log([redval, greenval, blueval], meshes)
        } else {
            if (meshes[0].fitness < 100) {
                for (let t = 0; meshes.length < 200; t++) {
                    let SandMesh = new GenNN([redval, blueval, greenval, redval, blueval, greenval, redval, blueval, greenval], 3, [27, 9, 3], 4)
                    meshes.push(SandMesh)
                }
            } else {
                if (meshes[0].fitness == 100) {
                    console.log(meshes[0])
                }
            }
        }
        redval = Math.random() + 0
        greenval = Math.random() + 0
        blueval = Math.random() + 0
        for (let t = 0; t < meshes.length; t++) {
            meshes[t].changeInputs([redval, greenval, blueval])
        }
    }
})
