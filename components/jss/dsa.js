export function swap(swp) {
    for(let i = 0; i < swp.length; i++) {
        for(let j = i; j < swp.length; j++) {
            if (swp[i].id.replaceAll(/\D/g, "") > swp[j].id.replaceAll(/\D/g, "")) {
                let temp = swp[i];
                swp[i] = swp[j];
                swp[j] = temp;
            }
        }
    }
}