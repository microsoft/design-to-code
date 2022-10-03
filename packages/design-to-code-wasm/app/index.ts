import * as Number from "./number";

import("../src/permutator/pkg").then(permutator => {
    Number.createNumberButtonFactory(permutator.permutate);
});
