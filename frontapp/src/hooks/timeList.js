export default function useTimeList() {
    const genList = (start=0, limit=30, morning=true, timeline=null) => {
        if (timeline) {
            for (let index = 0; index < timeline.length; index++) {
                const element = timeline[index];
                const d = new Date(element);
                if (morning) {
                    d.setHours(5, 30, 0, 0);
                }else {
                    d.setHours(19, 30, 0, 0);
                }

                timeline[index] = d.getTime();
            }
            return timeline.reverse();
        }

        const dates = [];
        for (let index = 0; index < limit; index++) {
            const d = new Date();
            d.setDate(new Date().getDate() - limit);
            if (morning) {
                d.setHours(5, 30, 0, 0);
            }else {
                d.setHours(19, 30, 0, 0);
            }
            d.setDate(d.getDate() + start); // Set the start date to 15 days from now
            d.setDate(d.getDate() + index);
            dates.push(d.getTime())
        }

        return dates.reverse();
    }

    return { genList }
}