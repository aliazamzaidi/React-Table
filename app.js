const Table = React.createClass({

    // getInitialState: function () {
    //     return {data: this.props.initialData};
    // },

    propTypes: {
        headers: React.PropTypes.arrayOf(React.PropTypes.string),
        initialData: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)),
    },

    getInitialState: function() {
        return {
            data: this.props.initialData,
            sortby: null,
            descending: false,
            edit: null
        };
    },

    sorting: function(inputNumber){
      let column = inputNumber.target.cellIndex;
      let data = this.state.data.slice();
      let descending = this.state.sortby === column && !this.state.descending;
        data.sort(function(a, b) {
            return descending
                ? (a[column] < b[column] ? 1 : -1)
                : (a[column] > b[column] ? 1 : -1);
        });
        this.setState({
            data: data,
        });
    },

    edit: function(editing){
        this.setState({edit:{
            row:parseInt(editing.target.dataset.row, 10),
            cell: editing.target.cellIndex
        }})
    },

    save: function(e){
        e.preventDefault();
        let input = e.target.firstChild;
        let Data = this.state.data.slice;
        data[this.state.edit.row][this.state.edit.cell] = input.value;
        this.setState({
            edit: null,
            data: data,
        });
    },

    render: function() {
        return (
            React.DOM.table(null,
                React.DOM.thead({onClick: this.sorting},
                    React.DOM.tr(null,
                        this.props.headers.map(function(title, number) {
                            if(this.state.sortby === number){
                                title += this.state.descending ? ' \u2191' : ' \u2193'
                            }
                            return React.DOM.th({key: number}, title);
                        }, this)
                    )
                ),
                React.DOM.tbody({onDoubleClick: this.edit},
                    this.state.data.map(function(row, rowidx) {
                        return (
                            React.DOM.tr({key: rowidx},
                                row.map(function(cell, number) {
                                    let content = cell;
                                    let edit = this.state.edit;
                                    if (edit && edit.row === rowidx && edit.cell === number) {
                                        content = React.DOM.form({onSubmit: this.save},
                                            React.DOM.input({
                                                type: 'text',
                                                defaultValue: cell,
                                            })
                                        );
                                    }

                                    return React.DOM.td({
                                        key: number,
                                        'data-row': rowidx,
                                    }, content);
                                }, this)
                            )
                        );
                    }, this)
                )
            )
        );
    }
});

const headers = [
    "Book", "Author", "Language", "Published", "Sales"
];

const data = [
    ["The Lord of the Rings", "J. R. R. Tolkien", "English", "1954–1955", "150 million"],
    ["Le Petit Prince (The Little Prince)", "Antoine de Saint-Exupéry", "French", "1943", "140 million"],
    ["Harry Potter and the Philosopher's Stone", "J. K. Rowling", "English", "1997", "107 million"],
    ["And Then There Were None", "Agatha Christie", "English", "1939", "100 million"],
    ["Dream of the Red Chamber", "Cao Xueqin", "Chinese", "1754–1791", "100 million"],
    ["The Hobbit", "J. R. R. Tolkien", "English", "1937", "100 million"],
    ["She: A History of Adventure", "H. Rider Haggard", "English", "1887", "100 million"],
];

ReactDOM.render(
    React.createElement(Table, {
        headers: headers,
        initialData: data,
    }),
    document.getElementById("div1")
);