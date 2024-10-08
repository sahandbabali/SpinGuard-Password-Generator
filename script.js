// global variables
let engine;
let world;
let compositeBody;
let centerConstraint;
let rotationSpeed = 0.03;
let isRotating = false;

let rectWidth = 150;
let rectHeight = 20;
let centerRectWidth = rectWidth + 120;
let centerRect;
let circles = [];
let rects = [];

// Tray parameters
let trayWidth = 400;
let trayHeight = 20;
let sideRectWidth = 20;
let sideRectHeight = 40;

// Tray components
let trayBase;
let leftSide;
let rightSide;

let textToDisplay = ""

// p5js setup function
function setup() {
    let canvas = createCanvas(600, 800);
    canvas.parent('canvasBox');

    engine = Matter.Engine.create();
    world = engine.world;

    engine.world.gravity.y = 1;

    let centerX = width / 2;
    let centerY = height / 2 - 150;

    rects = [];
    let radius = 200;

    // Creating the rectangles that create the wheel
    for (let i = 0; i < 8; i++) {
        let angle = (PI / 4) * i; // 45 degrees 
        let x = centerX + radius * cos(angle);
        let y = centerY + radius * sin(angle);

        let rectAngle = angle + PI / 2;

        let rect = Matter.Bodies.rectangle(x, y, rectWidth, rectHeight, {
            isStatic: true,
            angle: rectAngle,
            friction: 0.8,
            restitution: 0.1,
            render: { visible: false }
        });
        rect.visible = true;
        rects.push(rect);
    }

    // Rect in the center of the wheel
    centerRect = Matter.Bodies.rectangle(centerX, centerY, centerRectWidth, rectHeight, {
        isStatic: true,
        friction: 0.8,
        restitution: 0.1,
        render: { visible: false }
    });
    centerRect.visible = true;
    rects.push(centerRect);

    compositeBody = Matter.Body.create({
        parts: rects,
        isStatic: false
    });

    // Constraint at the center of the wheel
    centerConstraint = Matter.Constraint.create({
        pointA: { x: centerX, y: centerY },
        bodyB: compositeBody,
        pointB: { x: 0, y: 0 },
        stiffness: 0.9
    });

    Matter.World.add(world, [compositeBody, centerConstraint]);

    // Initialize tray components
    trayBase = Matter.Bodies.rectangle(width / 2, height - trayHeight / 2 - 100, trayWidth, trayHeight, {
        isStatic: true,
        friction: 0.8,
        restitution: 0.1,
        render: { visible: false }
    });

    leftSide = Matter.Bodies.rectangle(width / 2 - trayWidth / 2 - sideRectWidth / 2, height - trayHeight / 2 - 100, sideRectWidth, sideRectHeight, {
        isStatic: true,
        friction: 0.8,
        restitution: 0.1,
        render: { visible: false }
    });

    rightSide = Matter.Bodies.rectangle(width / 2 + trayWidth / 2 + sideRectWidth / 2, height - trayHeight / 2 - 100, sideRectWidth, sideRectHeight, {
        isStatic: true,
        friction: 0.8,
        restitution: 0.1,
        render: { visible: false }
    });

    // Add tray parts to the world
    Matter.World.add(world, [trayBase, leftSide, rightSide]);

    Matter.Engine.run(engine);
}




// p5js draw function
function draw() {
    background(256);

    if (isRotating) {
        Matter.Body.setAngle(compositeBody, compositeBody.angle + rotationSpeed);
    } else {
        let finalAngle = round(compositeBody.angle / (PI / 4)) * (PI / 4);
        Matter.Body.setAngle(compositeBody, finalAngle);
    }

    fill(127);
    stroke(0);

    // Draw the tray base
    if (trayBase) {
        push();
        translate(trayBase.position.x, trayBase.position.y);
        rotate(trayBase.angle);
        fill(150, 150, 150); // Gray color for the tray base
        rectMode(CENTER);
        rect(0, 0, trayBase.bounds.max.x - trayBase.bounds.min.x, trayBase.bounds.max.y - trayBase.bounds.min.y);
        pop();
    }

    // Draw the left side of the tray
    if (leftSide) {
        push();
        translate(leftSide.position.x, leftSide.position.y);
        rotate(leftSide.angle);
        fill(150, 150, 150); // Gray color for the left side
        rectMode(CENTER);
        rect(0, 0, leftSide.bounds.max.x - leftSide.bounds.min.x, leftSide.bounds.max.y - leftSide.bounds.min.y);
        pop();
    }

    // Draw the right side of the tray
    if (rightSide) {
        push();
        translate(rightSide.position.x, rightSide.position.y);
        rotate(rightSide.angle);
        fill(150, 150, 150); // Gray color for the right side
        rectMode(CENTER);
        rect(0, 0, rightSide.bounds.max.x - rightSide.bounds.min.x, rightSide.bounds.max.y - rightSide.bounds.min.y);
        pop();
    }

    // Draw the wheel parts
    for (let part of compositeBody.parts) {
        if (part !== compositeBody && part.visible) {
            push();
            translate(part.position.x, part.position.y);
            rotate(part.angle);
            rectMode(CENTER);

            if (part === centerRect) {
                rect(0, 0, centerRectWidth, rectHeight);
            } else {
                rect(0, 0, rectWidth, rectHeight);
            }

            pop();
        }
    }

    let charactersOnTray = [];

    // Draw the circles and collect characters touching the tray base
    for (let circle of circles) {
        // Check if the circle is touching the trayBase
        let touchingTrayBase = (
            circle.position.y + circle.circleRadius > trayBase.position.y - trayHeight / 2 &&
            circle.position.y - circle.circleRadius < trayBase.position.y + trayHeight / 2 &&
            circle.position.x + circle.circleRadius > trayBase.position.x - trayWidth / 2 &&
            circle.position.x - circle.circleRadius < trayBase.position.x + trayWidth / 2
        );

        push();
        translate(circle.position.x, circle.position.y);
        rotate(circle.angle);

        // Set color based on whether the circle is touching the trayBase
        if (touchingTrayBase) {
            fill('#86C701'); // Green
            //  fill(255, 0, 0); 
            charactersOnTray.push({ x: circle.position.x, character: circle.character });
        } else {
            fill(255, 0, 0); // Red
        }

        ellipse(0, 0, circle.circleRadius * 2);

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(16);
        text(circle.character, 0, 0);

        pop();
    }

    // Sort characters by x position
    charactersOnTray.sort((a, b) => a.x - b.x);

    // Draw characters at the bottom of the canvas
    push();
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    let yPos = height - 40;
    textToDisplay = charactersOnTray.map(item => item.character).join(' ');
    text(textToDisplay, width / 2, yPos);
    pop();
}











// Makes the wheel to start spinning
document.getElementById('spinButton').addEventListener('click', function () {
    isRotating = !isRotating;
    this.textContent = isRotating ? 'Stop' : 'Spin';
});



// Clears the bottom segment of the wheel 
document.getElementById('DropBalls').addEventListener('click', function () {

    // if there is no geenrated password start generating (drop the balls)
    if (!textToDisplay) {
        console.log("dropping");

        let maxYRect = rects.reduce((maxRect, currentRect) => {
            return currentRect.position.y > maxRect.position.y ? currentRect : maxRect;
        });

        Matter.Body.setPosition(maxYRect, {
            x: maxYRect.position.x,
            y: maxYRect.position.y - 100
        });

        Matter.Body.set(maxYRect, {
            collisionFilter: {
                group: -1,
                category: 0x0002,
                mask: 0x0001
            },
            isSensor: true,
            render: {
                visible: false
            }
        });

        maxYRect.visible = false;

        Matter.Body.setAngularVelocity(compositeBody, 0);
        Matter.Body.setInertia(compositeBody, Infinity);



        // change the text context to "Copy password"
        document.getElementById('DropBalls').textContent = "Copy Password";
    } else {

        // Copy the generated password

        let textToCopy = textToDisplay.replace(/\s+/g, '');
        navigator.clipboard.writeText(textToCopy).then(() => {
            console.log("Password copied to clipboard: " + textToCopy);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
});


// Creates balls in the wheel by dragging the mouse while clicking
function mouseDragged() {
    if (mouseButton === LEFT) {
        let radius = 15;
        let centerX = width / 2;
        let centerY = height / 2 - 150;

        // Calculate the distance between the mouse and the center of the composite object
        let distance = dist(mouseX, mouseY, centerX, centerY);

        // Only create a circle if the mouse is within a 200-pixel radius of the center
        // make radius global later
        if (distance <= 200) {
            let randomChar = getRandomCharacter();
            let circle = Matter.Bodies.circle(mouseX, mouseY, radius, {
                restitution: 0.1,
                friction: 0.9,
                mass: 1
            });

            // Assign the random character to the circle
            circle.character = randomChar;

            circles.push(circle);
            Matter.World.add(world, circle);
        }
    }
}




// This function generates a random character to be assigned to a ball

function getRandomCharacter() {
    let charType = floor(random(0, 4));

    if (charType === 0) {
        // 25% chance for an uppercase letter
        return String.fromCharCode(floor(random(65, 91)));
    } else if (charType === 1) {
        // 25% chance for a lowercase letter
        return String.fromCharCode(floor(random(97, 123)));
    } else if (charType === 2) {
        // 25% chance for a digit
        return String.fromCharCode(floor(random(48, 58)));
    } else {
        // 25% chance for a special character
        const specialChars = "!@#$%^&*()_+[]{}|;:,.<>?/~";
        return specialChars[floor(random(0, specialChars.length))];
    }
}


// Reset functionality
function resetSketch() {
    Matter.World.clear(world);
    circles = [];
    textToDisplay = ""
    document.getElementById('DropBalls').textContent = "Generate Password";
    setup();
}

document.getElementById('resetButton').addEventListener('click', resetSketch);