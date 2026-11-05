class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //executing query
    //This is done like this so we can chain other querying methods
    const jsonQueryString = JSON.parse(queryStr);
    console.log('query String: ', jsonQueryString);
    this.query = this.query.find(jsonQueryString);
    return this;
  }
  sort() {
    //implementing sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log('sortBy:', sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('tmdbId');
    }
    return this;
  }
  limitFields() {
    //field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      console.log('fields:', fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    //pagination
    const page = Number(this.queryString.page) || 1;
    const limit = Math.min(Number(this.queryString.limit) || 10, 100);
    console.log('limit', this.queryString.limit);
    //page 1 = 0-10
    //page 2 = 11-20
    // to get page 2 we have to skip 10 items to get page 3 we have to skip 20 items
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
