const sleep = ms => new Promise(res => setTimeout(res, ms))
const sleep1s = () => new Promise(res => setTimeout(res, 1000))

const START_TIME = 1652699558294
// 1652698647227 ms time
// 1652698625 s time

export const testRepeat = async (callback, n, startTime) => {
    let time = Date.now()
    if (time > startTime) {
        console.log("Start time has passed")
        return
    }
    while (time !== startTime) {
        time = Date.now()
        console.log(".")
        if (time > startTime) {
            console.log("Start time has passed")
            return
        }
    }

    await sleep1s()

    for (let i = 0; i < n; i++) {
        callback(Date.now())
        await sleep1s()
    }
}

function cb(time) {
    console.log("Print ", Date.now())
}


// export repeat;
// repeat(cb, 10)

// var event = new InputEvent('input', {
//     bubbles: true,
//     cancelable: false,
//     data: "a"
// });

// e.dispatchEvent(new InputEvent('input', {
//     bubbles: true,
//     cancelable: false,
//     data: "a"
// }))
