await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);
  const stats= await Tour.aggregate([
    {
      $match:{ratingsAverage:{$gte:4.5}}
    },
    {
      $group:{
      _id:null,
      // در خط بالا باید فیلدی را بدهیم که میخواهیم با آن گروهبندی کنیم
      avgRating:{$avg:'$ratingsAverage'},
      avgPrice:{$avg:'$price'},
      minPrice:{$min:'$price'},
      maxPrice:{$max:'$price'}
    }
    }
  ])