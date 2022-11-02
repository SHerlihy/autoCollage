import { determineAgglomeratedPerimeterIds } from "./determineAgglomeratedPerimeterIds";
import { separatePerimetersPointsMap } from "./determineCrevicedPerimeterVivoTestData";

describe("determineAgglomeratedPerimeter", () => {
  it("does not fail when agglomerating perimeters", () => {
    const agglomeratedPerimeter = determineAgglomeratedPerimeterIds(
      separatePerimetersPointsMap
    );

    expect(agglomeratedPerimeter).to.exist;
  });
});
