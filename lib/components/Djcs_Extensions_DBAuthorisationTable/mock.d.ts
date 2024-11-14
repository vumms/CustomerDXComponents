export declare const pyReviewRaw: {
    name: string;
    type: string;
    config: {
        template: string;
        ruleClass: string;
        localeReference: string;
        context: string;
    };
    children: {
        name: string;
        type: string;
        children: ({
            type: string;
            config: {
                value: string;
                label: string;
                key: string;
                datasource?: undefined;
            };
        } | {
            type: string;
            config: {
                value: string;
                label: string;
                datasource: {
                    source: string;
                    fields: {
                        value: string;
                    };
                };
                key: string;
            };
        })[];
    }[];
    classID: string;
};
export declare const regionChildrenResolved: ({
    readOnly: undefined;
    value: string;
    label: string;
    hasSuggestions: boolean;
    key: string;
    datasource?: undefined;
} | {
    readOnly: undefined;
    value: string;
    label: string;
    datasource: {
        fields: {
            value: undefined;
        };
        source: {
            value: string;
        }[];
    };
    hasSuggestions: boolean;
    key: string;
})[];
//# sourceMappingURL=mock.d.ts.map