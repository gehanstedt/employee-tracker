let inventory = [
    { name: 'table', quantity: 1 },
    { name: 'sofa', quantity: 2 },
    { name: 'chair', quantity: 3 }
  ];
  
  console.log(inventory.findIndex(obj => obj.name == 'chair'));