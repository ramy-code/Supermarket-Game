function play(){
    document.getElementsByClassName("gameContainer")[0].style.display = document.getElementsByClassName("gameContainer")[0].style.display == "none" ? "inherit" : "none";
}
let minSup = 0.01;
let minConf = 0.25;

function ItemSet(items) {
    this.items = items;
    this.support = 0;
}

function Rule(Left, Right) {
    this.left = Left;
    this.right = Right;
    this.confidence = 0;
}

function filtrer(itemSets, minSup) {
    return itemSets.filter(e => (e.support >= minSup));
}

function generateBiggerItemSets(itemSets) {
    //Génère les K_ItesmSets à partir des K-1_ItemSets
    let newTable = []; //Le tableau des nouveaux ItemsSet
    let size = itemSets[0].items.length - 1; //K-2 (nombre d'éléments qui doivent être en communs)
    for(let i = 0; i < itemSets.length - 1; i++) {
        for(let j = i + 1; j < itemSets.length; j++) {
            if(commonItems(itemSets[i].items, itemSets[j].items)) { //Si ils ont un préfixe commun
                let newItems = itemSets[i].items.map((x) => x); //Effectue une copie des items de itemSets[i]
                newItems.push(itemSets[j].items[size]);
                let is = new ItemSet(newItems);
                is.support = calculateSupport(newItems);
                if(is.support >= minSup)
                    newTable.push(is); //Ajouter le nouvel ItemSet #ctr: ajouter vérification si le nouvel item est fréquent (> minsup)
            }
        }
    }

    return newTable;
}

function calculateSupport(itemset) { //Calcul le support d'un itemset
    let indexes = []; //indexes des attributs d'itemsets
    for(let i = 0; i < itemset.length; i++) {
        indexes.push(data[0].indexOf(itemset[i]));
    }
    
    count = 0;
    for(let i = 1; i < data.length; i++) {
        let present = true;

        for(let j = 0; j < indexes.length && present; j++) {
            present = present && data[i][ indexes[j] ]; //Si l'attribut j (colonne j) est présent dans la transaction i (ligne i)
        }

        if(present)
            count++;
    }

    return count / (data.length - 1);
}

function commonItems(a, b) {
    if(a.length != b.length)
        throw 'ItemSets de tailles de différentes !';

    if(a.length == 1)
        return true;

    for(let i = 0; i < a.length - 1; i++) {
        if(a[i] != b[i])
            return false;
    }

    return true;
}

function generate1ItemSets() {
    let itemSet_1 = [];

    for(let j = 0; j < data[0].length; j++) {
        let itemset = new ItemSet([data[0][j]]);
        let count = 0;
        for(let i = 1; i < data.length; i++) {
            count += data[i][j];
        }
        itemset.support = count / (data.length - 1);
        if(itemset.support >= minSup)
            itemSet_1.push(itemset);
    }

    return itemSet_1;
}

function APriori() {
    //Génération des 1_ItemSets
    console.log('generating 1-itemsets:');
    let itemSet_1 = generate1ItemSets();
    console.log('finished 1-itemsets');

    let K_ItesmSets = [];
    let continuer = true;
    if(itemSet_1.length > 0)
        K_ItesmSets.push(itemSet_1);
    else continuer = false;

    let i = 0;
    while(continuer) {
        console.log('Generating ' + (i+2) + '-itemsets.');
        let lastGenerated = generateBiggerItemSets(K_ItesmSets[i]);
        console.log('size : ' + lastGenerated.length);
        if(lastGenerated.length > 0) {
            K_ItesmSets.push(lastGenerated);
            i++
        }
        else continuer = false;
    }

    for(let i = 0; i < K_ItesmSets.length; i++) {
        console.log(i+1 + '-itemset:')
        console.log(K_ItesmSets[i]);
    }

    console.log('Generating rules. \nRules:');
    let rules = []; //Liste de toutes les règles (tous les itemSets)
    for(let i = 1; i < K_ItesmSets.length; i++) {
        console.log(i+1 + '-itemset:')
        for(let j = 0; j < K_ItesmSets[i].length; j++) {
            let lastGeneratedRules = generateRules(K_ItesmSets[i][j]); //Générer des règles pour chaque ItemSet du K_ItemSet
            if(lastGeneratedRules.length != 0) //Intégrer les nouvelles règles
                rules = rules.concat(lastGeneratedRules);
        }
    }

    console.log(rules);
}

function generateRules(ItemSet) {
    let rules = []; //Liste des règles d'un seul itemSet
    let size = ItemSet.items.length;

    for(let i = 1; i < Math.pow(2, size) - 1; i++) {
        let left = [];
        let right = [];
        let pattern = toBinaryString(i, size);
        //console.log(pattern);

        for(let j = 0; j < size; j++) {
            if(pattern[j] == '0')
                left.push(ItemSet.items[j]);
            else
                right.push(ItemSet.items[j]);
        }

        let rule = new Rule(left, right);
        rule.confidence = ItemSet.support/calculateSupport(left);
        if(rule.confidence >= minConf) {
            rules.push(rule);
            console.log(left + '-->' + right + '    confiance: ' + rule.confidence);
        }
    }

    return rules;
}

function toBinaryString(n, length) {
    result = n.toString(2);
    while(result.length < length)
        result = '0' + result;
    
    return result;
}

APriori();