// This file includes a function to the the catalogue

// Use this function to get the catalogue from this project
export async function getStaticCatalogue<T>(path: string): Promise<T>{
    const response = await fetch(path);
    const data = await response.json();
    return data;
}

export function getCatalogueFromServer() {
    // TODO: Implement
}

export const catalogueText = {
    group: 'Group',
    collapseButtonTitle: 'Collapse Tree',
    expandButtonTitle: 'Expand Tree',
    numberInput: {
        labelFrom: 'von',
        labelTo: 'bis'
    }
};
